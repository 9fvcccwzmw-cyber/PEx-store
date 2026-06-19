// مصفوفة المنتجات (نفسها مالتك بدون تغيير)
const products = [
    { name: "iPhone 13", price: 150, image: "images/phone.jpg" },
    { name: "Laptop", price: 500, image: "images/laptop.jpg" },
    { name: "Headphone", price: 80, image: "images/Headphone.jpg" },
    { name: "Gaming Mouse", price: 30, image: "images/mouse.jpg" }
];

// عرض المنتجات في الصفحة
const productsContainer = document.getElementById("products");
products.forEach(product => {
    productsContainer.innerHTML += `
    <div class="product">
        <div class="image-box">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <h2>${product.name}</h2>
        <p>السعر: $${product.price}</p>
        <button onclick="addToCart('${product.name}', ${product.price})">إضافة إلى السلة</button>
    </div>
    `;
});

// مصفوفة السلة الجديدة
// مصفوفة السلة: تقرأ البيانات المحفوظة من المتصفح، وإذا فارغة تسوي مصفوفة جديدة
let cartArray = JSON.parse(localStorage.getItem("cart")) || [];

// عناصر الصفحة
const cart = document.getElementById("cart");
const cartItems = document.getElementById("cartItems");
const totalText = document.getElementById("total");

// دالة تحديث واجهة السلة (تشتغل كل ما نغير شي بالسلة)
// دالة تحديث واجهة السلة (تحديث العرض)
function updateCartUI() {
    cartItems.innerHTML = ""; // تصفير القائمة قبل إعادة الرسم
    let total = 0;
    let totalItems = 0;

    cartArray.forEach(item => {
        total += item.price * item.quantity;
        totalItems += item.quantity;

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong> <br>
                <small>$${item.price} × ${item.quantity}</small>
            </div>
            <div class="quantity-controls">
                <button onclick="decreaseQuantity('${item.name}')">-</button>
                <span>${item.quantity}</span>
                <button onclick="increaseQuantity('${item.name}')">+</button>
                <button class="delete-btn" onclick="removeFromCart('${item.name}')">❌</button>
            </div>
        `;
        cartItems.appendChild(li);
    });

    cart.innerText = "🛒 السلة: " + totalItems;
    totalText.innerText = "المجموع: $" + total;

    // === السطر الجديد المضاف لحفظ السلة ===
    localStorage.setItem("cart", JSON.stringify(cartArray));
}

// دالة زيادة الكمية (+)
function increaseQuantity(name) {
    const item = cartArray.find(item => item.name === name);
    if (item) {
        item.quantity += 1;
    }
    updateCartUI();
}

// دالة تقليل الكمية (-)
function decreaseQuantity(name) {
    const item = cartArray.find(item => item.name === name);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            // إذا كانت الكمية 1 وضغط ناقص، يحذف المنتج نهائياً
            removeFromCart(name);
            return; // نوقف الدالة هنا لأن removeFromCart هي راح تحدث الـ UI
        }
    }
    updateCartUI();
}

// دالة حذف منتج بالكامل من السلة (بقت نفسها)
function removeFromCart(name) {
    cartArray = cartArray.filter(item => item.name !== name);
    updateCartUI();
}

// إضافة منتج للسلة أو زيادة كميته
function addToCart(name, price) {
    // البحث إذا كان المنتج موجود مسبقاً بالسلة
    const existingItem = cartArray.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1; // زيادة الكمية
    } else {
        cartArray.push({ name: name, price: price, quantity: 1 }); // إضافة منتج جديد
    }

    updateCartUI();
}

// حذف منتج بالكامل من السلة
function removeFromCart(name) {
    cartArray = cartArray.filter(item => item.name !== name);
    updateCartUI();
}

// إفراغ السلة
function clearCart() {
    cartArray = [];
    updateCartUI();
}

// جلب عنصر النافذة المنبثقة
const modal = document.getElementById("orderModal");

// دالة فتح النافذة
function openModal() {
    if (cartArray.length === 0) {
        alert("سلتك فارغة! ضف بعض المنتجات أولاً.");
        return;
    }
    modal.style.display = "flex";
}

// دالة إغلاق النافذة
function closeModal() {
    modal.style.display = "none";
}

// دالة صياغة الرسالة وإرسالها للواتساب
function sendOrder(event) {
    event.preventDefault(); // منع الصفحة من التحديث عند إرسال الفورم

    // جلب معلومات الزبون من المدخلات
    const name = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;
    const address = document.getElementById("customerAddress").value;

    // رقم الواتساب الخاص بك (اكتب رقمك هنا مع رمز الدولة بدون أصفار أو علامة +)
    // مثال للعراق: 9647700000000
    const myWhatsAppNumber = "9647700000000"; 

    // بناء نص الطلبية
    let message = `*طلب جديد من متجر Hamoudi Store* 🛍️\n\n`;
    message += `👤 *الاسم:* ${name}\n`;
    message += `📞 *الرقم:* ${phone}\n`;
    message += `📍 *العنوان:* ${address}\n\n`;
    message += `🛒 *المنتجات المطلوبة:*\n`;

    let totalOrderPrice = 0;
    cartArray.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalOrderPrice += itemTotal;
        message += `- ${item.name} (العدد: ${item.quantity}) -> $${itemTotal}\n`;
    });

    message += `\n💰 *المجموع الكلي:* $${totalOrderPrice}`;

    // تشفير النص ليكون متوافقاً مع الرابط (URL Encoding)
    const encodedMessage = encodeURIComponent(message);

    // إنشاء رابط الواتساب الشغال على الموبايل والكمبيوتر
    const whatsAppURL = `https://wa.me/${9647852666846}?text=${encodedMessage}`;

    // فتح الرابط بنافذة جديدة لإرسال الرسالة
    window.open(whatsAppURL, "_blank");

    // تفريغ السلة وإغلاق النافذة بعد نجاح الطلب
    clearCart();
    closeModal();
}

// إغلاق النافذة تلقائياً إذا ضغط المستخدم في أي مكان خارج الصندوق الأبيض
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}
// استدعاء الدالة عند تحميل الصفحة لأول مرة لعرض المنتجات المحفوظة إن وجدت
updateCartUI();
