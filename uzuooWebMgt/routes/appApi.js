'use strict';
var customer = require('../models/forApp/customer');
var feedbacks = require('../models/forApp/feedbacks');
var orders = require('../models/forApp/orders');
var contracts = require('../models/forApp/contracts');
var sysSetting = require('../models/forApp/sysSetting');
var activities = require('../models/forApp/activities');
var bills = require('../models/forApp/bills');
var appAgentMgt = require('../models/forApp/application');
var qiniuToken = require('../models/forApp/upload');

var users = require('../models/users');
var login = require('../models/login');
var logout = require('../models/logout');
var history = require('../models/history');



module.exports = function (router, acl) {

    router.use(function sysLog(req, res, next) {

        history.addLogs(req,res,next);
    });

    router.get('/applications', function (req, res) {
        appAgentMgt.getApplications(req, res);
    });

    router.get('/setting/appVersions/:id', acl.middleware(2),function (req, res) {
        sysSetting.getAppVersionsById(req, res);
    });

    router.post('/setting/appVersion', acl.middleware(2),function (req, res) {
        sysSetting.setAppVersion(req, res);
    });

    router.delete('/setting/appVersion', acl.middleware(2),function (req, res) {
        sysSetting.delAppVersion(req, res);
    });

    router.get('/setting/levelRules', acl.middleware(2),function (req, res) {
        sysSetting.getLevelRules(req, res);
    });
    
    router.post('/setting/levelRules', acl.middleware(2),function (req, res) {
        sysSetting.updateLevelRules(req, res);
    });

    router.get('/setting/roleRules', acl.middleware(2),function (req, res) {
        sysSetting.getPointsRule(req, res);
    });

    router.post('/setting/roleRules', acl.middleware(2),function (req, res) {
        sysSetting.updatePointsRule(req, res);
    });

    router.get('/setting/craftRules', acl.middleware(2),function (req, res) {
        sysSetting.getCraftRule(req, res);
    });

    router.post('/setting/craftRules', acl.middleware(2),function (req, res) {
        sysSetting.updateCraftRule(req, res);
    });

    router.get('/setting/recommendRole', acl.middleware(2),function (req, res) {
        sysSetting.getRecommendRole(req, res);
    });

    router.post('/setting/recommendRole', acl.middleware(2),function (req, res) {
        sysSetting.setRecommendRole(req, res);
    });

    router.get('/setting/global', acl.middleware(2),function (req, res) {
        sysSetting.getSysConfig(req, res);
    });

    router.post('/setting/global', acl.middleware(2),function (req, res) {
        sysSetting.updateSysConfig(req, res);
    });

    router.get('/setting/roleAndRegions', acl.middleware(2),function (req, res) {
        customer.getRoleAndRegions(req, res);
    });

    router.post('/setting/regions', acl.middleware(2),function (req, res) {
        sysSetting.updateRegions(req, res);
    });
    
    router.post('/setting/provinces', acl.middleware(2),function (req, res) {
        sysSetting.addProvinces(req, res);
    });
    
    router.post('/setting/provinces/:provinceID', acl.middleware(2),function (req, res) {
        sysSetting.updateProvinceById(req, res);
    });
    
    router.post('/setting/provinces/:provinceID/cities', acl.middleware(2),function (req, res) {
        sysSetting.addCity(req, res);
    });
    
    router.post('/setting/provinces/:provinceID/cities/:cityID', acl.middleware(2),function (req, res) {
        sysSetting.updateCityById(req, res);
    });
    
    router.post('/setting/provinces/:provinceID/cities/:cityID/regions', acl.middleware(2),function (req, res) {
        sysSetting.addRegion(req, res);
    });
    
    router.post('/setting/provinces/:provinceID/cities/:cityID/regions/:regionID', acl.middleware(2),function (req, res) {
        sysSetting.updateRegionById(req, res);
    });
    
    router.post('/setting/workers/roles', acl.middleware(2),function (req, res) {
        sysSetting.Addrole(req, res);
    });
    
    router.post('/setting/workers/role/:id/name', acl.middleware(2),function (req, res) {
        sysSetting.UpdateRoleName(req, res);
    });
    
    router.post('/setting/workers/role/:id/visible', acl.middleware(2),function (req, res) {
        sysSetting.UpdateRoleVisible(req, res);
    });
    
    router.post('/setting/workers/role/:id/crafts', acl.middleware(2),function (req, res) {
        sysSetting.UpdateRoleCrafts(req, res);
    });
    
    router.post('/setting/workers/role/:id/crafts/:craftId/name', acl.middleware(2),function (req, res) {
        sysSetting.UpdateRoleCraftName(req, res);
    });
    
    router.post('/setting/workers/role/:id/crafts/:craftId/visible', acl.middleware(2),function (req, res) {
        sysSetting.UpdateRoleCraftVisible(req, res);
    });
    
    router.post('/setting/merchants/roles', acl.middleware(2),function (req, res) {
        sysSetting.AddMerchantsrole(req, res);
    });
    
    router.post('/setting/merchants/role/:id/name', acl.middleware(2),function (req, res) {
        sysSetting.UpdateMerchantsRoleName(req, res);
    });
    
    router.post('/setting/merchants/role/:id/visible', acl.middleware(2),function (req, res) {
        sysSetting.UpdateMerchantsRoleVisible(req, res);
    });
    
    router.post('/setting/merchants/role/:id/crafts', acl.middleware(2),function (req, res) {
        sysSetting.UpdateMerchantsRoleCrafts(req, res);
    });
    
    router.post('/setting/merchants/role/:id/crafts/:craftId/name', acl.middleware(2),function (req, res) {
        sysSetting.UpdateMerchantsRoleCraftName(req, res);
    });
    
    router.post('/setting/merchants/role/:id/crafts/:craftId/visible', acl.middleware(2),function (req, res) {
        sysSetting.UpdateMerchantsRoleCraftVisible(req, res);
    });
    
    //action for ajax request about app

    //action for houseOwner
    router.get('/houseOwners', function (req, res) {
        customer.houseOwner.findHouseOwnersByPage(req,res);
    });

    router.post('/houseOwners', function (req, res) {
        customer.houseOwner.createHouseOwner(req,res);
    });

    router.get('/houseOwners/:id', function (req, res) {
        customer.houseOwner.findHouseOwnersById(req,res);
    });

    router.get('/doGetRoleAndRegionsInfo', function (req, res) {
        customer.getRoleAndRegions(req,res);
    });
    
    router.get('/workers/decorationCases',acl.middleware(2),function (req, res) {
        customer.worker.getWorkersCases(req,res);
    });

    //action for workers
    router.get('/workers', acl.middleware(),function (req, res,next) {
        customer.worker.findWorkersByFilters(req,res);
    });

    router.get('/workers/:id',function (req, res) {
        customer.worker.findWorkerById(req,res);
    });

    //批量执行认证动作
    router.post('/workers/verificationStatus', function (req, res) {
        customer.worker.verifiedById(req,res);
    });

    router.get('/workers/:id/verification_logs', function (req, res) {
        customer.worker.findVerifiedRecordById(req,res);
    });

    router.post('/doUpdateWorkerProfileById', function (req, res) {
        customer.worker.updateWorkerProfileById(req,res);
    });

    //提交worker的认证信息
    /*router.post('/workers/:id/verification', function (req, res) {
        customer.updateWorkerProfileById(req,res);
    });*/

    router.post('/notifications',function (req, res) {
        customer.worker.sendNotifications(req,res);
    });

    router.post('/doChangeWorkerRole', function (req, res) {
        customer.worker.changeWorkerRole(req,res);
    });

    router.get('/capitalAccount/:id', function (req, res) {
        customer.getCapitalAccountById(req,res);
    });

    router.get('/workers/:id/decorationCases', function (req, res) {
        customer.worker.getDecorationCasesById(req,res);
    });

    router.get('/workers/:id/decorationCases/:caseId', function (req, res) {
        customer.worker.getDecorationCasesDetailById(req,res);
    });

    router.post('/workers/decorationCases/:id/verificationStatus', function (req, res) {
        customer.worker.updateWorkersCasesById(req,res);
    });

    router.get('/merchants', function (req, res,next) {
        customer.merchant.findMerchantsByFilters(req,res);
    });
    
    router.get('/merchants/decorationCases',function (req, res) {
        customer.merchant.getMerchantsCases(req,res);
    });
    
    router.get('/merchandises',function (req, res) {
        customer.merchant.getMerchandises(req,res);
    });
    
    router.post('/merchandises/:id/verificationStatus', function (req, res) {
        customer.merchant.updateMerchandisesById(req,res);
    });

    router.get('/merchants/:id', function (req, res,next) {
        customer.merchant.findMerchantById(req,res);
    });

    router.post('/merchants/:id/verification', function (req, res) {
        customer.merchant.updateMerchantProfileById(req,res);
     });

    router.post('/merchants/verificationStatus', function (req, res) {
        customer.merchant.verifiedMerchantById(req,res);
    });

    router.get('/merchants/:id/verification_logs', function (req, res) {
        customer.merchant.findMerchantVerifiedRecordById(req,res);
    });

    router.post('/merchants/decorationCases/:id/verificationStatus', function (req, res) {
        customer.merchant.updateMerchantsCasesById(req,res);
    });

    router.get('/merchants/:id/decorationCases', function (req, res) {
        customer.merchant.getMerchantDecorationCasesById(req,res);
    });

    router.get('/merchants/:id/decorationCases/:caseId', function (req, res) {
        customer.merchant.getMerchantDecorationCasesDetailById(req,res);
    });

    router.get('/merchants/:id/merchandise',function (req, res) {
        customer.merchant.getMerchandiseById(req,res);
    });

    router.get('/capitalAccount/:id/details', function (req, res) {
        customer.getCapitalAccountDetailsById(req,res);
    });

    router.get('/capitalAccount/:id/ubeans/details', function (req, res) {
        customer.getCapitalAccountUbeanDetailsById(req,res);
    });

    router.get('/capitalAccount/:id/margins/details', function (req, res) {
        customer.getCapitalAccountMarginDetailsById(req,res);
    });

    //线下充值
    router.post('/capitalAccount/paymentOrders', acl.middleware(2),function (req, res) {
        customer.chargeAccount(req,res);
    });

    router.get('/feedbacks', function (req, res) {
        feedbacks.getFeedbacks(req,res);
    });

    router.get('/orders', acl.middleware(),function (req, res) {
        orders.getOrders(req,res);
    });

    router.get('/orders/:id', /*acl.middleware(1),*/function (req, res) {
        orders.getOrderById(req,res);
    });

    router.get('/contracts/:id', function (req, res) {
        contracts.getContractById(req,res);
    });

    router.get('/contracts/:id/items', function (req, res) {
        contracts.getContractItem(req,res);
    });
    
    router.get('/contracts/:contractId/items/:itemId/buildingLogs', function (req, res) {
        contracts.getBuildingLogs(req,res);
    });
    
    router.post('/contracts/:contractId/items/:itemId/buildingLogs', function (req, res) {
        contracts.uploadBuildingLogs(req,res);
    });
    
    router.get('/contracts/:contractId/items/:itemId/changes', function (req, res) {
        contracts.getChanges(req,res);
    });

    router.get('/bills', acl.middleware(),function (req, res,next) {
        bills.getBills(req,res);
    });

    router.get('/bills/:billId', acl.middleware(2),function (req, res,next) {
        bills.getBillById(req,res);
    });

    //第一次审核，行为为post
    router.post('/bills/checkBill/:billId', acl.middleware(3),function (req, res) {
        bills.updateBillStatusById(req,res);
    });

    //承上，进行复核，行为为put，即将该支付订单的status更新
    router.put('/bills/checkBill/:billId', acl.middleware(3),function (req, res) {
        bills.updateBillStatusById(req,res);
    });

    //初核失败
    router.post('/bills/rejectBill/:billId', acl.middleware(3),function (req, res) {
        bills.updateBillStatusById(req,res);
    });

    //复核失败
    router.put('/bills/rejectBill/:billId', acl.middleware(3),function (req, res) {
        bills.updateBillStatusById(req,res);
    });


    //获取所有活动列表
    router.get('/activities', function (req, res) {
        activities.getActivities(req,res);
    });


    router.get('/activities/:id', function (req, res) {
        activities.getActivityById(req,res);
    });

    router.post('/activities/:id', function (req, res) {
        activities.setActivityById(req,res);
    });

    router.post('/activities/:id/status', function (req, res) {
        activities.setActivityStatus(req,res);
    });

    router.get('/advertisement/:position', function (req, res) {
        activities.getAdvertisement(req,res);
    });
    router.post('/advertisement', function (req, res) {
        activities.setAdvertisement(req,res);
    });

    router.get('/qiniuToken', function (req, res) {
        qiniuToken.getUploadToken(req,res);
    });

    router.get('/invitees/:accountId',function (req, res) {
        customer.findInviteesById(req,res);
    });
}