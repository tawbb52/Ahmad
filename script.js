// script.js

// رقم الواتساب
const phoneNumber = "966504106065";

// جميع أزرار الواتساب
document.querySelectorAll(".whatsapp-btn").forEach(button => {

button.addEventListener("click", function(e){

e.preventDefault();

// جلب اسم المنتج
const productName = this.getAttribute("data-product");

// إنشاء الرسالة
const message = `السلام عليكم، أرغب بطلب ${productName}`;

// تحويل النص لرابط
const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

// فتح واتساب
window.open(url, "_blank");

});

});
