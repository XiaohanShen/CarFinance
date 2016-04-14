var model = function() {
    var payAccounts = [{
        name: "张三",
        account: 6980808080808011
    }, {
        name: "李四",
        account: 8080808080001000
    }, {
        name: "王五",
        account: 18080182100111133
    }, {
        name: "赵四",
        account: 3131313113113131
    }, {
        name: "刘能",
        account: 90908081110101011
    }];

    var payeeAccountsArray = []; // 10 万条账户纪录 用于模糊匹配
    var bankNameArray = ["中国工商银行", "中国建设银行", "中国农业银行", "中国交通银行", "中国邮政储蓄银行", "招商银行", "中国银行", "民生银行", "上海浦东发展银行", "平安银行", "花旗银行"];
    var area = [{
        province: "山东",
        cities: ["济南", "青岛", "烟台", "临沂", "济宁"]
    }, {
        province: "黑龙江",
        cities: ["哈尔滨", "齐齐哈尔", "大庆", "佳木斯"]
    }, {
        province: "江苏",
        cities: ["苏州", "扬州", "常州"]
    }, {
        province: "北京市",
        cities: ["北京市"]
    }, {
        province: "天津市 ",
        cities: ["天津市"]
    }, {
        province: "河北",
        cities: ["石家庄", "张家口", "秦皇岛"]
    }, {
        province: "山西",
        cities: ["太原市", "大同市", "灵丘县"]
    }, {
        province: "内蒙古自治区",
        cities: ["包头", "赤峰", "呼和浩特", "鄂尔多斯"]
    }, {
        province: "辽宁",
        cities: ["沈阳市", "本溪市", "大连市"]
    }, {
        province: "吉林省",
        cities: ["长春市", "延边"]
    }, {
        province: "上海市",
        cities: ["上海市"]
    }, {
        province: "浙江省",
        cities: ["杭州市", "临安市", "余姚市"]
    }, {
        province: "福建省",
        cities: ["福州市", "长乐市"]
    }, {
        province: "江西省",
        cities: ["南昌市", "德兴市"]
    }, {
        province: "河南省",
        cities: ["郑州市", "新密市"]
    }, {
        province: "湖北省",
        cities: ["武汉市", "黄石市", "宜昌市"]
    }, {
        province: "湖南省",
        cities: ["长沙市", "湘潭市"]
    }, {
        province: "海南省",
        cities: ["三亚市", "海口市"]
    }, {
        province: "广西",
        cities: ["南宁市"]
    }, {
        province: "青海省",
        cities: ["西宁"]
    }, {
        province: "重庆市",
        cities: ["重庆市"]
    }, {
        province: "四川省",
        cities: ["成都", "绵阳"]
    }, {
        province: "西藏",
        cities: ["拉萨"]
    }, {
        province: "新疆",
        cities: ["乌鲁木齐", "喀什"]
    }];


    var bankList = []; //15万条收款银行 
    var pureBankList = []; // 只包含银行名的数组，用于模糊匹配
    var bankHash = {}; //用于快速匹配省市关联

    var randomInt1, randomInt2;
    for (var i = 0; i <= 150000; i++) {
        randomInt1 = Math.floor(Math.random() * (area.length - 1));
        randomInt2 = Math.floor(Math.random() * (area[randomInt1].cities.length - 1));
        var randomBankInt = Math.floor(Math.random() * (bankNameArray.length - 1));

        var bankName = bankNameArray[randomBankInt] + "No." + i;

        bankList.push({
            "bankName": bankName, //收款银行, 模拟生成各支行名 eg：中国工商银行No.11
            "bank": bankNameArray[randomBankInt], // eg:中国工商银行
            "province": area[randomInt1].province, // 省
            "city": area[randomInt1].cities[randomInt2] // 市
        });
        bankHash[bankName] = {
            "bankName": bankName, //收款银行, 模拟生成各支行名 eg：中国工商银行No.11
            "province": area[randomInt1].province, // 省
            "city": area[randomInt1].cities[randomInt2] // 市
        };
        pureBankList.push(bankName);
    }

    var accountsList = {}; // 10 万条账户记录
    var startNum = 3234536789;
    for (i = 0; i <= 100000; i++) {
        var intStr = startNum + i;
        randomInt1 = Math.floor(Math.random() * (bankList.length - 1));
        var temp = bankList[randomInt1].bank + intStr;
        //采用hash数组,key与"收款账户"一致
        accountsList[temp] = {
            "keyName": temp, //由银行名＋卡号组成
            "name": "用户名" + i, //用户名 mockup用数字代替
            "bank": bankList[randomInt1]
        };
        payeeAccountsArray.push(bankList[randomInt1].bank + intStr);
    }

    function GetCities(province) {
        for (var i = area.length - 1; i >= 0; i--) {
            if (area[i].province === province) {
                return area[i].cities;
            }
        }
    }

    return {
        payAccounts: payAccounts,
        payeeAccountsArray: payeeAccountsArray,
        bankNameArray: bankNameArray,
        GetCities: GetCities,
        area: area,
        bankList: bankList,
        accountsList: accountsList,
        pureBankList: pureBankList,
        bankHash: bankHash
    };

}();



(function() {
    $("#datePicker").datepicker(); //期望收款日

    $("#payeeAccount").autocomplete({
        source: model.payeeAccountsArray,
        minLength: 2,
        delay: 500
    }); // 收款账户 

    $("#payeeBank").autocomplete({
        source: model.pureBankList,
        minLength: 2
    }).bind('focus', function() {
        $(this).autocomplete("search");
    }); // 收款银行 中文

    // $('.pay_fieldset').on()

}());

ko.applyBindings(new KoViewModel());

function KoViewModel() {

    var self = this;
    self.payAccounts = ko.observableArray(model.payAccounts);
    self.payAccountSelect = ko.observable();


    self.sumCost = ko.observable(); //付款总额

    self.sumCost.subscribe(function(value) {
        self.actualNote(value * self.expNoteProp() / 100);
    });

    self.expCashProp = ko.observable(50); //期望现金比例

    var tempCashProp;
    self.expCashProp.subscribe(function(value) {
        tempCashProp = value;
    }, null, "beforeChange");

    self.expCashProp.subscribe(function(value) {
        self.isActualNoteTriggered(false);
        if (value > 100 || value < 0) {
            self.expCashProp(tempCashProp);
            alert("期望比例必须大于等于0小于等于100");
        }
    });

    self.isActualNoteTriggered = ko.observable(false);

    // 期望票据比例
    self.expNoteProp = ko.pureComputed({
        read: function() {
            return 100 - self.expCashProp();
        },
        write: function(value) {
            self.isActualNoteTriggered(false);
            self.expCashProp(100 - value);
        }
    });


    // 匹配现金
    self.actualCash = ko.computed({
        read: function() {
            if (self.isActualNoteTriggered()) {
                return self.sumCost() - self.actualNote();
            }
            var ret = self.sumCost() * self.expCashProp() / 100;
            return ret;
        },
        write: function(value) {
            self.actualNote(self.sumCost() - value);
        }
    });

    self.actualCash.subscribe(function(value) {
        if (!self.isActualNoteTriggered()) {
            self.actualNote(self.sumCost() - value);
        }
    });

    // 匹配票据
    self.actualNote = ko.observable();
    self.actualNote.extend({
        rateLimit: 50
    });
    self.actualNote.subscribe(function(value) {
        self.isActualNoteTriggered(true);
    });

    self.actualCashProp = ko.pureComputed({
        read: function() {
            return self.sumCost() > 0 ? self.actualCash() * 100 / self.sumCost() : 0;
        }
    });

    self.actualNoteProp = ko.pureComputed({
        read: function() {
            return self.sumCost() > 0 ? self.actualNote() * 100 / self.sumCost() : 0;
        }
    });

    self.payeeAccount = ko.observable(); // 收款账户
    self.payeeAccountName = ko.pureComputed({
        read: function() {
            if (model.accountsList[self.payeeAccount()] !== undefined) {
                return model.accountsList[self.payeeAccount()].name;
            }
        },
        write: function(value) {

        }
    }); // 收款户名


    self.bankName = ko.observable();
    self.bankNameComputed = ko.pureComputed({
        read: function() {
            if (model.accountsList[self.payeeAccount()] !== undefined) {
                var ret = model.accountsList[self.payeeAccount()].bank.bankName;
                self.bankName(ret);
                return ret;
            }
        },
        write: function(value) {
            self.bankName(value);
        }
    }); // 收款银行


    self.chosenProvince = ko.observable(); // 省 选中的
    self.chosenArea = ko.computed({
        read: function() {
            //if(model.accountsList[self.payeeAccount()] !== undefined){
            if (self.bankName() !== undefined && model.bankHash[self.bankName()] !== undefined) {
                var province = model.bankHash[self.bankName()].province;
                model.area.forEach(function(value) {
                    if (province === value.province) {
                        return self.chosenProvince(value);
                    }
                });
            }
        },
        write: function(value) {
            self.chosenProvince(value);
        }
    });

    self.area = ko.observableArray(model.area); //省 下拉列表

    self.cities = ko.pureComputed(function() {
        return self.chosenProvince() === undefined ? ["请选择..."] : self.chosenProvince().cities;
    }); //市 下拉列表


    self.chosenCity = ko.pureComputed({
        read: function() {
            if (self.bankName() !== undefined && model.bankHash[self.bankName()] !== undefined) {
                var city = model.bankHash[self.bankName()].city;
                return city;
            }
        },
        write: function(value) {

        }
    }); // 市 选中的

    self.addData = function() {
        if (self.bankName() !== undefined) {
            model.bankHash[self.bankName()] = {
                "bankName": self.bankName(), //收款银行, 模拟生成各支行名 eg：中国工商银行No.11
                "province": self.chosenProvince().province, // 省
                "city": self.chosenCity() // 市
            };
        }
        if (self.payeeAccount() !== undefined) {
            model.accountsList[self.payeeAccount()] = {
                "keyName": self.payeeAccount(), //由银行名＋卡号组成
                "name": self.payeeAccountName(), //用户名 mockup用数字代替
                "bank": {
                    "bank": self.bankName(),
                    "province": self.chosenProvince().province, // 省
                    "city": self.chosenCity(), // 市
                    "bankName": self.bankName()
                }
            };
        }
    };
}