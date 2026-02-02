/**
 * Error Handler Utilities
 * Chuyển đổi lỗi kỹ thuật thành thông báo thân thiện với người dùng
 */

// Map các lỗi kỹ thuật sang thông báo thân thiện
const ERROR_MESSAGES = {
  // Authentication errors
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  
  // Common errors
  400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Dữ liệu đã tồn tại hoặc bị xung đột.',
  422: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  
  // Server errors
  500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  502: 'Máy chủ đang bảo trì. Vui lòng thử lại sau.',
  503: 'Dịch vụ tạm thời không khả dụng.',
  504: 'Kết nối quá thời gian. Vui lòng thử lại.',
};

// Map các message lỗi cụ thể từ backend
const BACKEND_ERROR_MESSAGES = {
  // Login errors
  'Invalid credentials': 'Email hoặc mật khẩu không đúng.',
  'Invalid email or password': 'Email hoặc mật khẩu không đúng.',
  'User not found': 'Tài khoản không tồn tại.',
  'Account is blocked': 'Tài khoản đã bị khóa. Liên hệ quản trị viên.',
  'Account is inactive': 'Tài khoản chưa được kích hoạt.',
  'Email not verified': 'Email chưa được xác thực.',
  
  // Registration errors
  'Email already exists': 'Email đã được sử dụng.',
  'Username already exists': 'Tên đăng nhập đã tồn tại.',
  'Password too weak': 'Mật khẩu quá yếu. Cần ít nhất 8 ký tự.',
  
  // Paper errors
  'Paper not found': 'Không tìm thấy bài báo.',
  'File too large': 'File quá lớn. Tối đa 10MB.',
  'Invalid file type': 'Định dạng file không hợp lệ. Chỉ chấp nhận PDF.',
  'Submission deadline passed': 'Đã quá hạn nộp bài.',
  
  // Review errors
  'Review not found': 'Không tìm thấy đánh giá.',
  'Already reviewed': 'Bạn đã đánh giá bài này rồi.',
  'Not assigned': 'Bạn không được phân công đánh giá bài này.',
  
  // Conference errors
  'Conference not found': 'Không tìm thấy hội nghị.',
  'Conference is closed': 'Hội nghị đã đóng.',
  
  // Decision errors
  'Permission denied: Only conference chair can make decisions': 'Bạn không có quyền ra quyết định cho bài báo này. Chỉ Chủ tọa hội nghị mới có thể thực hiện.',
  
  // General errors
  'Unauthorized': 'Vui lòng đăng nhập để tiếp tục.',
  'Forbidden': 'Bạn không có quyền thực hiện thao tác này.',
  'Network Error': 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.',
  'timeout': 'Kết nối quá thời gian. Vui lòng thử lại.',
};

/**
 * Lấy thông báo lỗi thân thiện từ error object
 * @param {Error|Object} error - Error object từ axios hoặc catch
 * @param {string} defaultMessage - Thông báo mặc định nếu không xác định được lỗi
 * @returns {string} Thông báo lỗi thân thiện
 */
export function getErrorMessage(error, defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  if (!error) return defaultMessage;

  // Nếu là string, return trực tiếp
  if (typeof error === 'string') {
    return BACKEND_ERROR_MESSAGES[error] || error;
  }

  // Lấy message từ response backend
  const backendMessage = error.response?.data?.message 
    || error.response?.data?.error 
    || error.response?.data?.detail;
  
  if (backendMessage) {
    // Check xem có message mapping không
    if (BACKEND_ERROR_MESSAGES[backendMessage]) {
      return BACKEND_ERROR_MESSAGES[backendMessage];
    }
    // Nếu message không quá kỹ thuật (không có stack trace, code...), trả về
    if (!backendMessage.includes('Traceback') && 
        !backendMessage.includes('Error:') &&
        !backendMessage.includes('Exception') &&
        backendMessage.length < 150) {
      return backendMessage;
    }
  }

  // Lấy message theo HTTP status code
  const statusCode = error.response?.status;
  if (statusCode && ERROR_MESSAGES[statusCode]) {
    return ERROR_MESSAGES[statusCode];
  }

  // Check network error
  if (error.message === 'Network Error') {
    return BACKEND_ERROR_MESSAGES['Network Error'];
  }

  // Check timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return BACKEND_ERROR_MESSAGES['timeout'];
  }

  return defaultMessage;
}

/**
 * Lấy thông báo lỗi cho login
 */
export function getLoginErrorMessage(error) {
  return getErrorMessage(error, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
}

/**
 * Lấy thông báo lỗi cho register
 */
export function getRegisterErrorMessage(error) {
  return getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.');
}

/**
 * Lấy thông báo lỗi cho submit paper
 */
export function getSubmitPaperErrorMessage(error) {
  return getErrorMessage(error, 'Nộp bài thất bại. Vui lòng thử lại.');
}

/**
 * Lấy thông báo lỗi cho review
 */
export function getReviewErrorMessage(error) {
  return getErrorMessage(error, 'Gửi đánh giá thất bại. Vui lòng thử lại.');
}

/**
 * Lấy thông báo lỗi cho load data
 */
export function getLoadErrorMessage(error) {
  return getErrorMessage(error, 'Không thể tải dữ liệu. Vui lòng thử lại.');
}

/**
 * Lấy thông báo lỗi cho save/update
 */
export function getSaveErrorMessage(error) {
  return getErrorMessage(error, 'Lưu thất bại. Vui lòng thử lại.');
}

/**
 * Lấy thông báo lỗi cho delete
 */
export function getDeleteErrorMessage(error) {
  return getErrorMessage(error, 'Xóa thất bại. Vui lòng thử lại.');
}

export default {
  getErrorMessage,
  getLoginErrorMessage,
  getRegisterErrorMessage,
  getSubmitPaperErrorMessage,
  getReviewErrorMessage,
  getLoadErrorMessage,
  getSaveErrorMessage,
  getDeleteErrorMessage,
};
