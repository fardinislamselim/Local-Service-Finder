/**
 * Constructs FormData for Django REST Framework MultiPartParser.
 * Booking, Service, and Profile endpoints MUST be sent as multipart/form-data.
 * Leaves Content-Type unset so the browser auto-generates the multipart boundary.
 */
export function toFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          if (item instanceof File || item instanceof Blob) {
            formData.append(key, item);
          } else if (typeof item === "object") {
            formData.append(key, JSON.stringify(item));
          } else {
            formData.append(key, String(item));
          }
        }
      });
    } else if (typeof value === "boolean") {
      formData.append(key, String(value));
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export const buildFormData = toFormData;
export default toFormData;
