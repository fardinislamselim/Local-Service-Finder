// ==========================================
// 1. Core ID Types & Enums
// ==========================================

export type UserRole = "CUSTOMER" | "SERVICE_PROVIDER" | "ADMIN";

export type PricingType = "fixed" | "hourly" | "quotation" | "FIXED" | "HOURLY";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "partially_paid"
  | "paid"
  | "failed"
  | "refunded"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type FinalPaymentMethod = "cash" | "online" | "CASH" | "ONLINE";

// ==========================================
// 2. Generic Paginated Wrapper
// ==========================================

export interface ServiceMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
}

export interface PaginatedResponse<T> {
  count?: number;
  next: string | null;
  previous: string | null;
  results: T[];
  meta?: ServiceMeta;
}

// ==========================================
// 3. User & Profile Models
// ==========================================

export interface User {
  id: string; // UUID string
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_approved?: boolean;
  is_active?: boolean;
  date_joined?: string;
}

export type Gender = "MALE" | "FEMALE" | "OTHER" | "Male" | "Female" | "Other";

export interface Profile {
  id: number; // Integer ID
  user?: string | User; // UUID string or User object
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: UserRole;
  gender?: Gender | string;
  phone?: string;
  city?: string;
  area?: string;
  bio?: string;
  experience?: string | number;
  image?: string | null;
  is_active?: boolean;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Alias for backwards compatibility with existing UI components
export type UserProfile = Profile;

// ==========================================
// 4. Category Model
// ==========================================

export interface Category {
  id: string; // UUID string
  name: string;
  image?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  is_active?: boolean;
  image?: File | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  is_active?: boolean;
  image?: File | null;
}

// ==========================================
// 5. Service Model
// ==========================================

export interface Service {
  id: string; // UUID string
  name: string;
  category: string | number | Category;
  category_name?: string;
  description: string;
  shot_description?: string;
  pricing_type: PricingType;
  base_price?: string | number | null;
  hour_base_price?: string | number | null;
  is_active: boolean;
  image?: string | null;
  provider?: string | User | Profile;
  provider_name?: string;
  provider_area?: string;
  provider_upazila?: string;
  average_rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
  create_at?: string;
  update_at?: string;
}

export interface CreateServiceInput {
  name: string;
  category: string;
  description?: string;
  shot_description?: string;
  pricing_type: "fixed" | "hourly" | "quotation";
  base_price?: string | number;
  hour_base_price?: string | number;
  is_active?: boolean | string;
  image?: File | null;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  hour_base_price?: string | number;
  image?: File | null;
}

export interface SearchServiceParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  upazila?: string;
}

export type PaginatedServicesResponse = PaginatedResponse<Service>;

// ==========================================
// 6. Booking Model
// ==========================================

export interface Booking {
  id: string; // UUID string
  service: string | Service;
  service_name?: string;
  service_title?: string;
  service_details?: Service;
  customer?: string | User | Profile;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  provider?: string | User | Profile;
  provider_name?: string;
  user?: string;
  booking_date: string;
  booking_time: string;
  duration?: string;
  final_payment_method: FinalPaymentMethod;
  note?: string;
  status: BookingStatus;
  payment_status?: PaymentStatus;
  price_at_booking?: string | number;
  advance_amount?: string | number;
  paid_amount?: string | number;
  remaining_amount?: string | number;
  total_amount?: string | number;
  is_paid?: boolean;
  is_advance_paid?: boolean;
  is_final_paid?: boolean;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  completed_time?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingInput {
  service: string;
  booking_date: string;
  booking_time: string;
  duration?: string;
  final_payment_method: FinalPaymentMethod;
  note?: string;
}

export interface UpdateBookingInput {
  booking_date?: string;
  booking_time?: string;
  note?: string;
}

export interface CancelBookingInput {
  cancellation_reason: string;
}

// ==========================================
// 7. Payment Model
// ==========================================

export interface Payment {
  id: string; // UUID string
  booking: string | Booking;
  amount: string | number;
  status: PaymentStatus;
  tran_id?: string;
  val_id?: string;
  payment_type?: "advance" | "final" | "ADVANCE" | "FINAL" | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export type PaymentRecord = Payment;

export interface PaymentInitiateResponse {
  status?: string;
  message?: string;
  GatewayPageURL?: string;
  gateway_url?: string;
  payment_url?: string;
  sessionkey?: string;
  tran_id?: string;
  [key: string]: unknown;
}

// ==========================================
// 8. Review Model
// ==========================================

export interface Review {
  id: number; // Integer ID
  booking?: string | Booking;
  service: string | Service;
  customer?: string | User | Profile;
  customer_name?: string;
  customer_image?: string | null;
  rating: number;
  review: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReviewInput {
  rating: number | string;
  review: string;
  booking_id: string | number;
  service_id: string | number;
}

export interface UpdateReviewInput {
  rating: number | string;
  review: string;
}

export interface AverageRatingResponse {
  average_rating: number | null;
  total_reviews?: number;
}

// ==========================================
// 9. Location Models
// ==========================================

export interface Division {
  id: number; // Integer ID
  name: string;
}

export interface District {
  id: number; // Integer ID
  name: string;
  division: number | Division;
  division_name?: string;
}

export interface Upazila {
  id: number; // Integer ID
  name: string;
  district: number | District;
  district_name?: string;
}

export interface CreateDivisionInput {
  name: string;
}

export interface CreateDistrictInput {
  name: string;
  division: number | string;
}

export interface CreateUpazilaInput {
  name: string;
  district: number | string;
}

// ==========================================
// 10. Authentication Requests & Responses
// ==========================================

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupResponse {
  id?: string;
  message?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  [key: string]: unknown;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponse {
  access_token: string;
  refresh_token: string;
  user?: User;
  profile?: Profile;
  [key: string]: unknown;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface SignoutRequest {
  refresh: string;
}

// ==========================================
// 11. Dashboard Overview
// ==========================================

export interface AdminDashboardOverview {
  message?: string;
  total_active_accounts?: number;
  total_pending_accounts?: number;
  [key: string]: unknown;
}

export interface PendingAccount {
  id: string | number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  phone_number?: string;
  is_active: boolean;
  is_approved?: boolean;
  date_joined?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface CustomerDashboardOverview {
  message?: string;
  total_orders?: number;
  completed_bookings?: number;
  pending_bookings?: number;
  [key: string]: unknown;
}

export interface ProviderDashboardOverview {
  message?: string;
  total_accepted?: number;
  total_completed?: number;
  pending_count?: number;
  [key: string]: unknown;
}

export interface UpdateProfileInput {
  gender?: Gender | string;
  phone?: string;
  city?: string;
  area?: string;
  bio?: string;
  experience?: string | number;
  image?: File | null;
}
