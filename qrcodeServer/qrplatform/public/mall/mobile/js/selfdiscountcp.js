var discount = {
    renderDiscountList: function() {
        $('#number').html(discount.list.length)
    },

    init: function(res) {
        discount.list = res.data;
        discount.renderDiscountList()
    }
}

app.checkLogin()
.then(app.checkOut.getDiscount)
.then(discount.init)
.catch(function(err) {
    console.log(err)
})

$('.action').on('click', 'button', function() {
    window.location.href = './marketindex.html';
})