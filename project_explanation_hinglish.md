# Food Delivery Service - Detailed Project Working (Hinglish)

Bhai, ye project ek **Microservices Architecture** par based hai. Iska matlab hai ki humne poore project ko chhote-chhote independent hisso (services) mein tod diya hai, taaki agar kal ko project bada ho jaye ya koi ek service fail ho jaye, toh poora app band na ho.

Chalo ek-ek karke samajhte hain ki kaunsi service kya karti hai aur kaise kaam karti hai.

---

## 🏗 Infrastructure Services (Core System)

Ye services aam user ko nahi dikhti, lekin baaki saari services inke bina kaam nahi kar sakti.

### 1. Eureka Server (Service Registry) - Port: `8761`
- **Kaam:** Ye ek "Phonebook" ya "Directory" ki tarah kaam karta hai. 
- **Working:** Jab bhi baaki koi service (jaise user-service ya order-service) start hoti hai, toh wo seedha Eureka ke paas aati hai aur apna naam aur IP address register karwa leti hai. 
- **Fayda:** Iska fayda ye hai ki agar order-service ko payment-service se baat karni hai, toh use payment-service ka IP yaad rakhne ki zaroorat nahi. Wo seedha Eureka se poochta hai ki "Bhai, payment-service kahan chal rahi hai?", aur Eureka usko uska address de deta hai.

### 2. Config Server - Port: `8888`
- **Kaam:** Ye sabhi services ki configuration (settings) ko ek jagah manage karta hai.
- **Working:** Har service ki apni `application.properties` ya `.yml` file hoti hai (jaise database password, port number). Config server in sab configurations ko ek central jagah se control karta hai taaki baar-baar har service ke code mein jaake change na karna pade.

### 3. API Gateway - Port: `8080`
- **Kaam:** Ye poore project ka "Main Gate" ya "Security Guard" hai.
- **Working:** Jab bhi frontend (Mobile App ya Website) se koi request aati hai, toh wo seedha kisi service ke paas nahi jaati. Wo sabse pehle API Gateway par aati hai. API Gateway check karta hai ki ye request kis cheez ke liye hai:
  - Agar request `/user/login` ki hai, toh wo request `user-service` ko bhej dega.
  - Agar request `/order/create` ki hai, toh wo request `order-service` ko bhej dega.
- **Fayda:** Isse frontend ko pata nahi hota ki peeche kitni microservices chal rahi hain. Frontend sirf API Gateway (Port `8080`) se baat karta hai.

---

## 💻 Frontend (User Interface)

Ye wo hissa hai jo aam user ya customer apne phone ya computer par dekhta aur chalata hai.

### Frontend App (Mobile/Web)
- **Kaam:** User ko ek sundar aur aasaan UI (User Interface) dena. 
- **Working:** Frontend khud se database se baat nahi kar sakta. Iska kaam sirf itna hai ki ye user se order ya details le (jaise konsa khana chahiye) aur use **API Gateway** ke paas bhej de. Phir API Gateway se jo jawab aata hai (jaise restaurant ka menu), use user ki screen par dikha de.
- **Fayda:** Isse user ko peeche chal rahi kisi bhi service (Eureka, Config, MySQL) ke baare me kuch pata nahi lagta. User sirf ek smooth Zomato-jaisi app chalata hai.

---
## 🍔 Business Services (Jo Asli Kaam Karti Hain)

Ye wo services hain jisme aapka actual business logic likha hua hai.

### 4. User Service - Port: `8081`
- **Database:** `user_service_db` (MySQL)
- **Kaam:** Ye service sirf aur sirf users (customers, delivery agents, admin) ka data handle karti hai.
- **Working:** Jab naya user app par signup karta hai, toh uski details yahan save hoti hain. Jab user login karta hai, toh ye service verify karti hai ki password sahi hai ya nahi aur uske hisaab se token (security pass) generate karke deti hai.

### 5. Restaurant Service - Port: `8082`
- **Database:** `restaurant_service_db` (MySQL)
- **Kaam:** Ye service Zomato/Swiggy ki tarah restaurants aur unke menus ka hisaab rakhti hai.
- **Working:** Kaunsa restaurant app par available hai? Unke menu mein kya-kya dishes hain? Ek dish ka price kya hai? Ye sab yahi service handle karti hai. Jab aap app kholte ho aur restaurants ki list aati hai, toh data ishi service se aata hai.

### 6. Order Service - Port: `8083`
- **Database:** `order_service_db` (MySQL)
- **Kaam:** Ye iss project ka "Boss" hai jab koi customer khana order karta hai.
- **Working:** Jab aap cart mein item daalkar "Place Order" par click karte ho, toh request yahan aati hai. Ye service kya-kya karti hai:
  1. Pehle ye `Restaurant Service` se poochti hai ki item available hai aur price kya hai.
  2. Phir ye Order ka ek record create karti hai ki "Order Pending" hai.
  3. Phir ye `Payment Service` ko bolti hai ki customer se paise cut karlo.

### 7. Payment Service - Port: `8084`
- **Database:** `payment_service_db` (MySQL)
- **Kaam:** Ye saari financial transactions (paise ki len-den) manage karti hai.
- **Working:** Jab `Order Service` isko bolti hai, toh ye Stripe/Razorpay (payment gateways) ke through user ke account se paise deduct karti hai. Agar payment successful ho gayi, toh ye wapas `Order Service` ko bata deti hai ki "Bhai paise mil gaye, order confirm kardo". Agar payment fail hui, toh order cancel ho jata hai.

### 8. Notification Service - Port: `8085`
- **Database:** `notification_service_db` (MySQL)
- **Kaam:** User ko update rakhna.
- **Working:** Jab koi order place hota hai ya payment successfully ho jati hai, toh `Order Service` ya `Payment Service` isko ek message bhejti hai. Ye service customer ko Email ya SMS bhejti hai jaise:
  - "Your order has been placed successfully."
  - "Your payment of ₹500 is received."
  - "Your food is out for delivery."

---

## 🔄 Ek Live Example se Samjho (End-to-End Flow)

Socho aapne app khola aur ek Pizza order karna hai:

1. Aapne app khola aur Pizza search kiya. Frontend ne request **API Gateway** ko bheji. Gateway ne use **Restaurant Service** ke paas bhej diya. Aapko Pizza dikh gaya.
2. Aapne login kiya. Request **API Gateway** se **User Service** ke paas gayi aur aap verify ho gaye.
3. Aapne "Order Now" pe click kiya. 
4. Request seedha **Order Service** ke paas aayi. Usne check kiya ki Pizza hai na?
5. **Order Service** ne ab **Payment Service** ko request bheji ki customer ke card se ₹500 cut karo.
6. **Payment Service** ne transaction complete ki aur Order Service ko bola "Done".
7. **Order Service** ne order ka status "Confirmed" kar diya.
8. Saath hi mein, usne **Notification Service** ko bola ki customer ko message kar do.
9. Aapke phone pe ek SMS aa jata hai - *"Order Confirmed! Your Pizza is getting ready."*

Agar aap ye project kisi dusre developer ko doge, toh is documentation se usko ekdum crystal clear samajh aa jayega ki kaunsa code kahan dhundhna hai aur flow kaise kaam kar raha hai!
