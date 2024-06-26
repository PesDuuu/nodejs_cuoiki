const $ = document.querySelector.bind(document);
const User = JSON.parse(localStorage.getItem("loginUser"));
const http = "http://localhost:8080/api/v1";
import { header, formatCurrency, alertFullil, alertFail } from "./header.js";

function log(value) {
  console.log(`${value}: `, value);
}

// format date
function formatDate(date) {
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formattedDate(date) {
  const dated = new Date(`${date}`);
  return formatDate(dated);
}

// ========== get orders ========== //

async function getPurchased() {
  await fetch(`${http}/order`, {
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${User?.token}`,
    },
  })
    .then((data) => data.json())
    .then((data) => {
      log(data);
      renderPurchased(data);
    })
    .catch((err) => {
      console.log(err);
    });
}

// ========== cancel order ========== //

async function cancelOrder(id) {
  console.log(id);
  await fetch(`${http}/order/${id}`, {
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${User?.token}`,
    },
    method: "put",
  })
    .then((data) => data.json())
    .then((data) => {
      if (data.success) {
        alertFullil(data.message);
        getPurchased();
      } else {
        alertFail(data.message);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function rateStar(productId, orderId, rating) {
  return fetch(`${http}/rating`, {
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${User?.token}`,
    },
    method: "post",
    body: JSON.stringify({ productId, orderId, rating }),
  })
    .then((data) => data.json())
    .then((data) => {
      if (data.success) {
        return Promise.resolve(data);
      } else {
        return Promise.reject(data);
      }
    })
    .catch(() => {
      return Promise.reject();
    });
}

function renderPurchased(data) {
  const html = data.data.map((val, index) => {
    let count = 0;
    let status = val.status;
    const cancelBtn =
      status == "Đang chờ"
        ? `<button data-id="${val._id}" class="btn btn-danger btn-cancel">Hủy Đơn</button>`
        : "";
    const producthtml = val.products.map((v, i) => {
      count = count + v.quantity;
      const ratingClass = v.rating > 0 ? "disabled" : "";
      const ratingButton =
        status == "Đã giao"
          ? v.rating > 0
            ? " "
            : `<button class="btn btn-rate">Rating</button>`
          : "";
      return `
        <div data-id="${v.id}" class="product">
          <img src="${v.img}" alt="">
          <div class="p-name">
            <h4 class="name-product">${v.name}</h4>
            <span class="quantity">x${v.quantity}</span>
          </div>
          <p class="p-total">${formatCurrency(v.price)}</p>
          <div data-id="${v.id}" data-rating="${
        v.rating
      }" class="stars-rating ${ratingClass}">
            <i class="fa-sharp fa-solid fa-star"></i>
            <i class="fa-sharp fa-solid fa-star"></i>
            <i class="fa-sharp fa-solid fa-star"></i>
            <i class="fa-sharp fa-solid fa-star"></i>
            <i class="fa-sharp fa-solid fa-star"></i>
          </div>
          ${ratingButton}
        </div>
      `;
    });
    return `
      <div class="block">
        <div class="address d-flex justify-content-between">
          <div class="address-content d-block">
          <p class="p-createdAt"><strong>Đặt vào:</strong> ${formattedDate(
            val.createdAt
          )}</p>
            <p class="p-address"><strong>Địa chỉ:</strong> ${val.address}</p>
            
          </div>
          <div class="total d-block">
            <p class="t-quantity"><strong>Số sản phẩm:</strong> ${count}</p>
            <p class="t-price"><strong>Tổng tiền:</strong> ${formatCurrency(
              val.total
            )}</p>
            <p class="t-methods"><strong>Phương thức:</strong> ${
              val.methods
            }</p>
          </div>
          <div class="status d-block">
            <p class="s-status"><strong>Trang thái:</strong> ${val.status}</p>
            <hr style="margin-bottom: 0; color: white;">
            ${cancelBtn}
          </div>
        </div>
        <hr>
        <div data-id="${val._id}" class="products">
          ${producthtml.join("")}
        </div>
      </div>
    `;
  });
  $(".purchased").innerHTML = html.join("");
}

function handleRatingClick(event) {
  const starElement = event.target.closest(".stars-rating .fa-star");
  if (starElement) {
    const starsContainer = starElement.parentElement;
    const allStars = Array.from(starsContainer.children);
    const selectedIndex = allStars.indexOf(starElement);
    allStars.forEach((star, index) => {
      if (index <= selectedIndex) {
        star.classList.add("filled");
      } else {
        star.classList.remove("filled");
      }
    });
    starsContainer.dataset.rating = selectedIndex;
  }
}

function refreshRate() {
  const starsRatingElements = document.querySelectorAll(".stars-rating");
  starsRatingElements.forEach((starsRatingElement) => {
    const rating = parseInt(starsRatingElement.dataset.rating);

    // Delete all 'filled' classes of stars before resetting
    starsRatingElement.querySelectorAll("i").forEach((starElement) => {
      starElement.classList.remove("filled");
    });

    // Set the 'filled' class for the number of stars corresponding to the rating value
    for (let i = 0; i < rating; i++) {
      const starElement = starsRatingElement.querySelector(
        `i:nth-child(${i + 1})`
      );
      if (starElement) {
        starElement.classList.add("filled");
      }
    }
  });
}

window.addEventListener("load", function (e) {
  getPurchased();
  header();
  setTimeout(() => {
    refreshRate();
  }, 1000);

  const purchased = $(".purchased");
  purchased.addEventListener("click", function (e) {
    const products = e.target.closest(".products");
    const product = e.target.closest(".product");
    const stars = e.target.closest(".stars-rating .fa-star");
    const rate = e.target.closest(".btn-rate");
    const img = e.target.closest("img");
    const name = e.target.closest(".name-product");
    const btnCancel = e.target.closest(".btn-cancel");

    if (stars) {
      handleRatingClick(e);
    }

    if (rate) {
      const id = product.dataset.id;
      const idoder = products.dataset.id;
      const rateNumber =
        +product.querySelector(".stars-rating").dataset.rating + 1;

      rateStar(id, idoder, rateNumber)
        .then((data) => {
          if (data.success) {
            alertFullil(data.message);
            rate.remove();
          } else {
            alertFail(data.message);
          }
        })
        .catch((err) => {
          alertFail(err);
        });
    }

    if (img || name) {
      const id = product.dataset.id;
      fetch(`${http}/product/${id}`)
        .then((data) => data.json())
        .then((data) => {
          console.log(data);
          if (data.success) {
            window.location.href = `./detail.html?idpd=${id}`;
          } else {
            alertFail(data.message);
          }
        });
    }

    if (btnCancel) {
      const id = btnCancel.dataset.id;
      cancelOrder(id);
    }
  });
});
