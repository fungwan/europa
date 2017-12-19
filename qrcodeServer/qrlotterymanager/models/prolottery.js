/**
*create by codesmith
**/
module.exports = function (sequelize, datatypes) {
	return sequelize.define('prolottery', {
		lotteryid: { type: datatypes.STRING(50), primaryKey: true },
		projectid: { type: datatypes.STRING(50) },
		name: { type: datatypes.STRING(50) },
		prizecount: { type: datatypes.INTEGER, allowNull: true },
		amount: { type: datatypes.INTEGER, allowNull: true },
		price: { type: datatypes.DECIMAL, allowNull: true },
		summoney: { type: datatypes.DECIMAL, allowNull: true },
		mallproductname: { type: datatypes.STRING(50), allowNull: true },
		mallproducttype: { type: datatypes.STRING(50), allowNull: true },
		mallproductid: { type: datatypes.STRING(50), allowNull: true }
	},
		{
			timestamps: false
		})
}
