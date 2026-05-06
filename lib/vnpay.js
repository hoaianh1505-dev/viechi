import crypto from 'crypto';

export const createPaymentUrl = (order, ipAddr) => {
  const date = new Date();
  const createDate = formatDate(date);
  
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const orderId = order._id.toString();
  const amount = order.totalAmount * 100; // VNPay uses cents (multiplied by 100)
  
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang: ' + orderId;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  // Sort parameters alphabetically
  vnp_Params = sortObject(vnp_Params);

  // Generate the query string
  const querystring = new URLSearchParams(vnp_Params).toString();
  
  // Create HmacSHA512 hash
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(querystring, 'utf-8')).digest("hex");
  
  // Append secure hash to the final URL
  return vnpUrl + '?' + querystring + '&vnp_SecureHash=' + signed;
};

export const verifyReturnUrl = (params) => {
  const secretKey = process.env.VNP_HASH_SECRET;
  const secureHash = params['vnp_SecureHash'];

  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];

  const sortedParams = sortObject(params);
  const querystring = new URLSearchParams(sortedParams).toString();
  
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(querystring, 'utf-8')).digest("hex");

  return secureHash === signed;
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[decodeURIComponent(str[key])] = obj[decodeURIComponent(str[key])];
  }
  return sorted;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);
  const second = ('0' + date.getSeconds()).slice(-2);
  return `${year}${month}${day}${hour}${minute}${second}`;
}
