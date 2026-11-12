// 1. Authentication & Accounts
export type UserRole = "CUSTOMER" | "SERVICE_PROVIDER" | "ADMIN";

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupResponse {
  id?: number | string;
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
  user?: UserProfile;
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

// 2. Categories
export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

// 3. Services
export type PricingType = "FIXED" | "HOURLY";

export interface Service {
  id: number;
  name: string;
  category: number | Category;
  category_name?: string;
  description: string;
  pricing_type: PricingType;
  base_price: string | number;
  hour_base_price: string | number;
  is_active: boolean;
  image?: string | null;
  provider?: number | UserProfile;
  provider_name?: string;
  provider_area?: string;
  provider_upazila?: string;
  average_rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceInput {
  name: string;
  category: number | string;
  description: string;
  pricing_type: PricingType;
  base_price?: string | number;
  hour_base_price?: string | number;
  is_active?: boolean | string;
  image?: File | null;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  hour_base_price?: string | number;
  base_price?: string | number;
  is_active?: boolean | string;
  image?: File | null;
}

export interface SearchServiceParams {
  search?: string;
  area?: string;
  upazila?: string;
}

// 4. Profiles
export type Gender = "MALE" | "FEMALE" | "OTHER" | "Male" | "Female" | "Other";

export interface UserProfile {
  id: number;
  user?: number;
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

export interface UpdateProfileInput {
  gender?: Gender | string;
  phone?: string;
  city?: string;
  area?: string;
  bio?: string;
  experience?: string | number;
  image?: File | null;
}

// 5. Bookings
export type FinalPaymentMethod = "ONLINE" | "CASH";
export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export interface Booking {
  id: number;
  service: number | Service;
  service_name?: string;
  service_title?: string;
  service_details?: Service;
  customer?: number | UserProfile;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  provider?: number | UserProfile;
  provider_name?: string;
  booking_date: string;
  booking_time: string;
  final_payment_method: FinalPaymentMethod;
  note?: string;
  status: BookingStatus;
  advance_amount?: string | number;
  total_amount?: string | number;
  remaining_amount?: string | number;
  is_advance_paid?: boolean;
  is_final_paid?: boolean;
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingInput {
  service: number | string;
  booking_date: string;
  booking_time: string;
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

// 6. Reviews & Ratings
export interface Review {
  id: number;
  booking?: number;
  service: number;
  customer?: number | UserProfile;
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
  booking_id: number | string;
  service_id: number | string;
}

export interface UpdateReviewInput {
  rating: number | string;
  review: string;
}

export interface AverageRatingResponse {
  average_rating: number;
  total_reviews?: number;
}

// 7. Dashboard
export interface AdminDashboardOverview {
  message?: string;
  total_active_accounts?: number;
  total_pending_accounts?: number;
  [key: string]: unknown;
}

export interface PendingAccount {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  is_active: boolean;
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

// 8. Locations
export interface Division {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  division: number | Division;
  division_name?: string;
}

export interface Upazila {
  id: number;
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

// 9. Payments
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | string;

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

export interface PaymentRecord {
  id: number;
  booking: number;
  amount: string | number;
  status: PaymentStatus;
  tran_id?: string;
  val_id?: string;
  payment_type?: "ADVANCE" | "FINAL" | string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

