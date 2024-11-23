export const sendCenterToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  console.log(token);

  //options for cookie 
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents access by JavaScript
    secure: false,    // Ensure cookies are sent only over HTTPS
    sameSite: 'Strict', // Prevent CSRF
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user,
    token,
    message,
  })
};


export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  console.log(token);
  //options for cookie 
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000), //5 days 
    path: '/',// Set the correct path for the cookie
    sameSite: 'None', // Adjust this for testing
    httpOnly: true,
    secure: false  // Ensure cookies are sent only over HTTPS
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user,
    token,
    message,
  })
}




