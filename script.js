// ==========================================
// 📦 مصفوفة المنتجات: أضف أو عدل أي منتج هنا بسهولة!
// ==========================================
const products = [
    
    {
        id: 1,
        name: "HXSJ V200 keyboard",
        price: 25000,
        images: ["images/keyboard.jpg", "images/keyboard2.jpg"],
        description: "Gaming Keyboard"
    },
    {
        id: 2,
        name: "Tonor TC30 USB Microphone",
        price: 30000,
        images: ["images/microphone.jpg", "images/microphone2.jpg"],
        description: "Professional USB Microphone for Streaming and Recording"
    },

    {
        id: 3,
        name: "Beats Studio Pro",
        price: 25000,
        images: ["images/beats_studio_pro.jpg", "images/beats_studio_pro2.jpg"],
        description: "High-performance wireless headphones with active noise cancellation"
    },

    {
        id: 4, // تأكد من إعطاء رقم مميز وغير مكرر للمنتج الجديد
        name: "Razer Kraken X Standard Edition", // اسم المنتج الذي سيظهر للزبون
        price: 35000, // السعر بالدينار العراقي كرقـم سادة (بدون فواصل أو نقاط)
        images: ["images/Razer_Kraken.jpg", "images/Razer_Kraken2.jpg"], // الصورة الأولى للخارج، والثانية للتفاصيل بالداخل
        description: "Razer Kraken X Standard Edition gaming headset" // وصف المنتج
    },

    {
        id: 5,
        name: "M41 Hi-Fi",
        price: 15000,
        images: ["images/M41_Hi-Fi.jpg", "images/M41_Hi-Fi2.jpg"],
        description: "M41 Hi-Fi Air buds with high-quality sound and long battery life"
    }

];

// سلة المشتريات المتزامنة مع الـ LocalStorage
let cart = JSON.parse(localStorage.getItem("pex_cart")) || [];

// جلب المؤثرات الصوتية
const clickSound = document.getElementById("clickSound");
const cartSound = document.getElementById("cartSound");
const successSound = document.getElementById("successSound");

// دالة تشغيل الصوت الآمنة والسريعة
function playAudio(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0; 
        audioElement.play().catch(err => console.log("تحذير تشغيل الصوت: ", err));
    }
}

// دالة تنسيق العملة العراقية تلقائياً
function formatIraqiPrice(price) {
    if (price >= 1000000) {
        const millions = Math.floor(price / 1000000);
        const remainder = price % 1000000;
        if (remainder === 0) return `${millions} مليون دينار`;
        return `${millions} مليون و ${(remainder / 1000).toLocaleString('ar-EG')} ألف دينار`;
    }
    return `${(price / 1000).toLocaleString('ar-EG')} ألف دينار`;
}

// عرض المنتجات ديناميكياً في الواجهة الخارجية
function displayProducts(productsToRender = products) {
    const productsContainer = document.getElementById("products");
    const noProductsMessage = document.getElementById("noProductsMessage");
    
    if (!productsContainer) return;
    productsContainer.innerHTML = "";

    if (productsToRender.length === 0) {
        noProductsMessage.style.display = "block";
        return;
    }
    noProductsMessage.style.display = "none";

    productsToRender.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.className = "product";
        // يعرض دائماً أول صورة في المصفوفة [0] بالخارج
        productDiv.innerHTML = `
            <div class="image-box" onclick="viewProductDetails(${product.id})">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <h2 onclick="viewProductDetails(${product.id})" style="cursor:pointer;">${product.name}</h2>
            <p class="product-desc">${product.description}</p>
            <div class="price">${formatIraqiPrice(product.price)}</div>
            <button onclick="addToCart('${product.name}', ${product.price})">🛒 إضافة للسلة</button>
        `;
        productsContainer.appendChild(productDiv);
    });
}

// دالة البحث الذكي
function searchProducts() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    displayProducts(filtered);
}

// إضافة منتج إلى السلة
function addToCart(name, price) {
    playAudio(cartSound);
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
    showToast(`تم إضافة (${name}) إلى السلة بنجاح! 🎉`);
}

// تحديث وعرض محتويات السلة
function updateCart() {
    localStorage.setItem("pex_cart", JSON.stringify(cart));
    const cartBadge = document.getElementById("cartBadge");
    const summaryTotalItems = document.getElementById("summaryTotalItems");
    const totalElement = document.getElementById("total");
    const cartItemsContainer = document.getElementById("cartItems");

    let totalItems = 0;
    let totalPrice = 0;

    if (cartItemsContainer) cartItemsContainer.innerHTML = "";

    cart.forEach((item, index) => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        if (cartItemsContainer) {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong style="color:#1e293b; display:block; max-width:250px;">${item.name}</strong>
                    <span style="color:#10b981; font-weight:bold;">${formatIraqiPrice(item.price)}</span>
                </div>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(li);
        }
    });

    if (cartBadge) cartBadge.innerText = totalItems;
    if (summaryTotalItems) summaryTotalItems.innerText = `${totalItems} قطع`;
    if (totalElement) totalElement.innerText = formatIraqiPrice(totalPrice);
    
    const navCartIcon = document.getElementById("navCartIcon");
    if (navCartIcon) {
        navCartIcon.classList.add("shake-animation");
        setTimeout(() => navCartIcon.classList.remove("shake-animation"), 500);
    }
}

function changeQuantity(index, change) {
    playAudio(clickSound);
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    playAudio(clickSound);
    if (confirm("هل أنت متأكد من رغبتك في إفراغ السلة؟")) {
        cart = [];
        updateCart();
        showToast("تم إفراغ السلة بالكامل 🗑️");
    }
}

function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `🔔 <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s ease-out reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// فتح نافذة تفاصيل المنتج وعرض صورة رقم 2 المحددة ديناميكياً
const productModal = document.getElementById("productDetailsModal");

function viewProductDetails(id) {
    playAudio(clickSound);
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("detailProductName").innerText = product.name;
    document.getElementById("detailProductDesc").innerText = product.description;
    document.getElementById("detailProductPrice").innerText = formatIraqiPrice(product.price);
    
    const mainImg = document.getElementById("mainDetailImage");
    
    // تعرض تلقائياً الصورة الثانية المصاحبة لرقم 2 (الموقع رقم [1] بالمصفوفة)
    if (product.images && product.images.length > 1) {
        mainImg.src = product.images[1];
    } else {
        mainImg.src = product.images[0];
    }

    // بناء المصغرات في المعرض للتنقل بسهولة
    const thumbContainer = document.getElementById("thumbnailsContainer");
    thumbContainer.innerHTML = "";
    
    product.images.forEach((imgSrc, idx) => {
        const thumb = document.createElement("img");
        thumb.src = imgSrc;
        thumb.style = "width: 50px; height: 50px; object-fit: contain; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; padding: 3px; background:#fff;";
        if ((product.images.length > 1 && idx === 1) || (product.images.length === 1 && idx === 0)) {
            thumb.style.borderColor = "#4f46e5";
        }
        thumb.onclick = function() { 
            playAudio(clickSound);
            mainImg.src = imgSrc; 
            Array.from(thumbContainer.children).forEach(el => el.style.borderColor = "#e2e8f0");
            thumb.style.borderColor = "#4f46e5";
        };
        thumbContainer.appendChild(thumb);
    });

    // تفعيل تكبير الصورة عند الكبس عليها
    mainImg.onclick = openImageZoom;

    document.getElementById("detailAddToCartBtn").onclick = function() {
        addToCart(product.name, product.price);
        closeProductDetails();
    };

    if (productModal) productModal.style.display = "flex";
}

function closeProductDetails() {
    playAudio(clickSound);
    if (productModal) productModal.style.display = "none";
}

// نافذة تكبير الصور الاحترافية (Image Zoom)
function openImageZoom() {
    const mainImg = document.getElementById("mainDetailImage");
    const zoomModal = document.getElementById("imageZoomModal");
    const zoomedImg = document.getElementById("zoomedImage");
    
    if (mainImg && zoomModal && zoomedImg && mainImg.src) {
        playAudio(clickSound);
        zoomedImg.src = mainImg.src;
        zoomModal.style.display = "flex";
    }
}

function closeImageZoom() {
    const zoomModal = document.getElementById("imageZoomModal");
    if (zoomModal) {
        playAudio(clickSound);
        zoomModal.style.display = "none";
    }
}

// طلب الشحن والواتساب
const orderModal = document.getElementById("orderModal");

function openModal() {
    playAudio(clickSound);
    if (cart.length === 0) {
        showToast("سلتك فارغة حالياً! قم بإضافة منتجات أولاً 🛒");
        return;
    }
    if (orderModal) orderModal.style.display = "flex";
}

function closeModal() {
    playAudio(clickSound);
    if (orderModal) orderModal.style.display = "none";
}

function sendOrder(event) {
    event.preventDefault();
    playAudio(successSound);

    const name = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;
    const address = document.getElementById("customerAddress").value;

    let orderText = `*طلب جديد من متجر PEx Store 🛍️*\n\n`;
    orderText += `👤 *الاسم:* ${name}\n`;
    orderText += `📞 *رقم الهاتف:* ${phone}\n`;
    orderText += `📍 *العنوان:* ${address}\n\n`;
    orderText += `📦 *المنتجات المطلوبة:*\n`;

    let total = 0;
    cart.forEach(item => {
        orderText += `- ${item.name} (العدد: ${item.quantity}) -> ${formatIraqiPrice(item.price * item.quantity)}\n`;
        total += item.price * item.quantity;
    });

    orderText += `\n💰 *المجموع الكلي للحساب:* ${formatIraqiPrice(total)}`;
    const whatsappUrl = `https://wa.me/9647701234567?text=${encodeURIComponent(orderText)}`;
    showToast("جاري تحويلك للواتساب لإرسال الطلب... 🚀");
    
    setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        cart = [];
        updateCart();
        closeModal();
        closeCartPage();
    }, 1500);
}

// تفاعلات الحركة والنبضات المائية للأزرار والمؤشر العائم
document.addEventListener("DOMContentLoaded", function () {
    const glow = document.querySelector('.mouse-glow');
    if (glow) {
        document.addEventListener('mousemove', function (e) {
            window.requestAnimationFrame(() => {
                glow.style.left = `${e.clientX}px`;
                glow.style.top = `${e.clientY}px`;
            });
        });
        document.addEventListener('mouseleave', () => glow.style.opacity = '0');
        document.addEventListener('mouseenter', () => glow.style.opacity = '1');
    }
});

document.addEventListener("click", function (e) {
    const button = e.target.closest("button") || e.target.closest(".nav-cart") || e.target.closest(".clear-cart-btn");
    if (!button) return;

    if (!button.hasAttribute("onclick") || button.classList.contains("back-to-shop") || button.id === "detailAddToCartBtn") {
        if (!button.outerHTML.includes("addToCart") && !button.outerHTML.includes("sendOrder") && !button.outerHTML.includes("changeQuantity")) {
            playAudio(clickSound);
        }
    }

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
});

function openCartPage() {
    playAudio(clickSound);
    document.getElementById("cartSection").style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeCartPage() {
    playAudio(clickSound);
    document.getElementById("cartSection").style.display = "none";
    document.body.style.overflow = "auto";
}

window.onload = function() {
    displayProducts();
    updateCart();
};