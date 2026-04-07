// 替代 Axios 的原生 fetch 封装
export const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers || {});
  
  // 模拟携带token拦截器
  const token = localStorage.getItem("token") || "";
  if (token) {
    // 根据Casdoor可能放在Bearer
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || response.statusText || "Request failed");
  }

  const data = await response.json();
  return data.data !== undefined ? data.data : data;
};

export const get = <T>(url: string, options?: RequestInit) => 
  request<T>(url, { ...options, method: "GET" });

export const post = <T>(url: string, body: any, options?: RequestInit) => 
  request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) });

export const put = <T>(url: string, body: any, options?: RequestInit) => 
  request<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) });

export const del = <T>(url: string, options?: RequestInit) => 
  request<T>(url, { ...options, method: "DELETE" });
