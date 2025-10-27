import { AuthService } from "@/services/auth.service";

// ===== UTILITY FUNCTIONS =====

/**
 * Lấy base URL từ environment
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

/**
 * Lấy access token từ localStorage
 */
function getAccessToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

/**
 * Tạo headers cơ bản
 */
function createBaseHeaders(options?: RequestInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
}

/**
 * Tạo headers có authentication
 */
function createAuthHeaders(options?: RequestInit): HeadersInit {
  const token = getAccessToken();
  return {
    ...createBaseHeaders(options),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Thực hiện fetch request cơ bản
 */
async function performFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fetch failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as T;
}

/**
 * Retry logic cho refresh token (tối đa 3 lần)
 */
async function retryRefreshToken(): Promise<boolean> {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount <= maxRetries) {
    try {
      console.log(
        `Attempting to refresh token (attempt ${retryCount + 1}/${maxRetries + 1})`,
      );

      await AuthService.refreshToken();
      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error(`Refresh token attempt ${retryCount + 1} failed:`, error);

      if (retryCount < maxRetries) {
        // Delay trước khi retry (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retryCount++;
      } else {
        console.error("Max retries reached, refresh token failed");
        return false;
      }
    }
  }

  return false;
}

/**
 * Xử lý lỗi authentication và retry
 */
async function handleAuthError<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  console.log("Authentication error detected, attempting to refresh token...");

  const refreshSuccess = await retryRefreshToken();

  if (refreshSuccess) {
    // Thử lại request với token mới
    const headers = createAuthHeaders(options);

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fetch failed: ${response.status} ${errorText}`);
    }

    return (await response.json()) as T;
  } else {
    throw new Error("Authentication failed: Unable to refresh token");
  }
}

// ===== MAIN EXPORT FUNCTIONS =====

/**
 * Fetch client cơ bản - không có authentication và retry logic
 * Dùng cho các API public không cần đăng nhập
 */
export async function publicFetchClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const headers = createBaseHeaders(options);
  return performFetch<T>(endpoint, { ...options, headers });
}

/**
 * Fetch client có authentication - có retry logic khi gặp lỗi 401/403
 * Dùng cho các API cần đăng nhập
 */
export async function fetchClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const headers = createAuthHeaders(options);

  try {
    return await performFetch<T>(endpoint, { ...options, headers });
  } catch (error: any) {
    // Kiểm tra nếu là lỗi authentication
    if (error.message.includes("401") || error.message.includes("403")) {
      return handleAuthError<T>(endpoint, { ...options, headers });
    }
    throw error;
  }
}
