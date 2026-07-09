var currentCity = JSON.parse(localStorage.getItem('qimen_city')) || DEFAULT_CITY;

function calculateTrueSolarTime(beijingTime, lat, lng) {
    console.log(beijingTime, lat, lng);
    
    // 1. 删除未使用的 deltaT（或后续集成）
    // var deltaT = calculateDeltaT(beijingTime); 
    
    // 2. 获取均时差（假设该函数返回的是【秒】）
    var equationOfTimeSeconds = calculateEquationOfTime(beijingTime);
    
    // 3. 计算经度时差（分钟）
    var longitudeOffsetMinutes = (lng - 120) * 4;
    
    // 4. 计算真太阳时总分钟数（将秒转换为分钟）
    var trueSolarMinutes = beijingTime.getHours() * 60 + beijingTime.getMinutes() 
                           + longitudeOffsetMinutes 
                           + (equationOfTimeSeconds / 60); // 关键修正点！
    
    var trueSolarTime = new Date(beijingTime.getTime());
    // 修改后（去掉Math.round，保留小数）
    var hours = Math.floor(trueSolarMinutes / 60);
    var minutes = Math.floor(trueSolarMinutes % 60);
    var seconds = Math.round((trueSolarMinutes % 1) * 60);

    // 处理60秒进位
    if (seconds === 60) {
        seconds = 0;
        minutes++;
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
    }

    // 一次性设置时、分、秒（秒数会覆盖掉克隆自原时间的秒数）
    trueSolarTime.setHours(hours, minutes, seconds, 0);
    // var totalMinutes = Math.round(trueSolarMinutes);
    // trueSolarTime.setHours(Math.floor(totalMinutes / 60));
    // trueSolarTime.setMinutes(totalMinutes % 60);
    // trueSolarTime.setSeconds(0);
    
    console.log(trueSolarTime);
    return trueSolarTime;
}

function calculateDeltaT(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var jd = julianDate(year, month, day);
    var t = (jd - 2451545.0) / 36525.0;
    var deltaT = 62.92 + 32.184 * t - 0.5532 * t * t + 0.007575 * t * t * t - 0.00000595 * t * t * t * t;
    return deltaT;
}

function julianDate(year, month, day) {
    if (month <= 2) {
        year--;
        month += 12;
    }
    var a = Math.floor(year / 100);
    var b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function calculateEquationOfTime(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var n = julianDate(year, month, day) - julianDate(year, 1, 1) + 0.5;
    var L = 280.460 + 0.9856474 * n;
    var g = 357.528 + 0.9856003 * n;
    L = L % 360;
    g = g % 360;
    var lambda = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
    var epsilon = 23.439 - 0.0000004 * n;
    var alpha = Math.atan2(Math.cos(epsilon * Math.PI / 180) * Math.sin(lambda * Math.PI / 180), Math.cos(lambda * Math.PI / 180)) * 180 / Math.PI;
    if (alpha < 0) alpha += 360;
    var siderealTime = 100.46 + 0.9856474 * n + L;
    var equationOfTime = siderealTime - alpha;
    equationOfTime = equationOfTime % 360;
    if (equationOfTime > 180) equationOfTime -= 360;
    if (equationOfTime < -180) equationOfTime += 360;
    return equationOfTime * 4;
}

function updatePan(timestamp, city) {
    var url = '/api/qimen?' + $.param({
        timestamp: timestamp,
        location: city.province + city.city + city.district,
        lat: city.lat,
        lng: city.lng
    });
    
    $.getJSON(url, function(data) {
        if (data.error) {
            alert('排盘错误: ' + data.message);
            return;
        }
        
        $('#cityDisplay').text(city.province + city.city + city.district);
        
        if (data.basicInfo) {
            $('#panType').text(data.basicInfo.type || '');
            $('#panMethod').text(data.basicInfo.method || '');
            $('#solarDate').text(data.basicInfo.date || '');
            $('#lunarDate').text(data.basicInfo.lunarDate || '');
        }
        
        if (data.siZhu) {
            $('.label-primary').eq(0).text(data.siZhu.year || '');
            $('.label-primary').eq(1).text(data.siZhu.month || '');
            $('.label-primary').eq(2).text(data.siZhu.day || '');
            $('.label-primary').eq(3).text(data.siZhu.time || '');
        }
        
        $('#xunShou').text(data.xunShou || '');
        $('#juShu').text(data.juShu && data.juShu.fullName || '');
        $('#zhiFu').text((data.zhiFuXing || '') + '(' + (data.zhiFuGong || '') + '宫)');
        $('#zhiShi').text((data.zhiShiMen || '') + '(' + (data.zhiShiGong || '') + '宫)');
        
        if (data.analysis) {
            $('#overallLuck').removeClass('da_ji xiao_ji ping xiao_xiong da_xiong');
            $('#overallLuck').addClass(data.analysis.overallJiXiong || 'ping');
            $('#overallLuck').text(data.analysis.overallJiXiongText || '平');
        }
        
        var gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
        gongOrder.forEach(function(i) {
            var cell = $('table.pan-table tbody tr').eq(gongOrder.indexOf(i));
            if (cell.length > 0) {
                cell.find('td:eq(1)').text(data.diPan && data.diPan[String(i)] || '');
                cell.find('td:eq(2)').text(data.sanQiLiuYi && data.sanQiLiuYi[String(i)] || '');
                cell.find('td:eq(3)').text(data.jiuXing && data.jiuXing[String(i)] || '');
                cell.find('td:eq(4)').text(data.baMen && data.baMen[String(i)] || '');
                cell.find('td:eq(5)').text(data.baShen && data.baShen[String(i)] || '');
                cell.find('td:eq(6)').text(data.maStar && data.maStar.gong === String(i) ? '马' : '');
                cell.find('td:eq(7)').text(data.kongWangGong && data.kongWangGong.includes(String(i)) ? '空' : '');
            }
        });
    }).fail(function() {
        alert('获取排盘数据失败');
    });
}

function initCitySelectors() {
    var provinceSelect = $('#provinceSelect');
    var citySelect = $('#citySelect');
    var districtSelect = $('#districtSelect');
    var latInput = $('#latInput');
    var lngInput = $('#lngInput');
    
    for (var province in CITIES) {
        provinceSelect.append($('<option>', {
            value: province,
            text: province
        }));
    }
    
    provinceSelect.val(currentCity.province);
    
    provinceSelect.change(function() {
        citySelect.empty().append($('<option>', { value: '', text: '请选择城市' }));
        districtSelect.empty().append($('<option>', { value: '', text: '请选择区县' }));
        latInput.val('');
        lngInput.val('');
        
        var province = $(this).val();
        if (province && CITIES[province]) {
            for (var city in CITIES[province]) {
                citySelect.append($('<option>', {
                    value: city,
                    text: city
                }));
            }
        }
    });
    
    provinceSelect.trigger('change');
    citySelect.val(currentCity.city);
    
    citySelect.change(function() {
        districtSelect.empty().append($('<option>', { value: '', text: '请选择区县' }));
        latInput.val('');
        lngInput.val('');
        
        var province = provinceSelect.val();
        var city = $(this).val();
        if (province && city && CITIES[province] && CITIES[province][city]) {
            for (var district in CITIES[province][city]) {
                districtSelect.append($('<option>', {
                    value: district,
                    text: district
                }));
            }
        }
    });
    
    citySelect.trigger('change');
    districtSelect.val(currentCity.district);
    
    districtSelect.change(function() {
        var province = provinceSelect.val();
        var city = citySelect.val();
        var district = $(this).val();
        
        if (province && city && district && CITIES[province] && CITIES[province][city] && CITIES[province][city][district]) {
            var coords = CITIES[province][city][district];
            latInput.val(coords.lat);
            lngInput.val(coords.lng);
        } else {
            latInput.val('');
            lngInput.val('');
        }
    });
    
    districtSelect.trigger('change');
    
    $('#saveCityBtn').click(function() {
        var province = provinceSelect.val();
        var city = citySelect.val();
        var district = districtSelect.val();
        
        if (!province || !city || !district) {
            alert('请完整选择省份、城市和区县');
            return;
        }
        
        var coords = CITIES[province][city][district];
        currentCity = {
            province: province,
            city: city,
            district: district,
            lat: coords.lat,
            lng: coords.lng
        };
        
        localStorage.setItem('qimen_city', JSON.stringify(currentCity));
        $('#cityModal').modal('hide');
        
        var beijingTime = new Date();
        var trueSolarTime = calculateTrueSolarTime(beijingTime, currentCity.lat, currentCity.lng);
        updatePan(trueSolarTime.getTime(), currentCity);
    });
}

function initRealTimePan() {
    $('#realtimePan').click(function(e) {
        e.preventDefault();
        var beijingTime = new Date();
        var trueSolarTime = calculateTrueSolarTime(beijingTime, currentCity.lat, currentCity.lng);
        updatePan(trueSolarTime.getTime(), currentCity);
    });
}

function initCustomPan() {
    var now = new Date();
    var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    var timeStr = String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');
    
    $('#date').val(dateStr);
    $('#time').val(timeStr);
    
    $('#submitCustomPan').click(function() {
        var dateStr = $('#date').val();
        var timeStr = $('#time').val();
        var location = $('#location').val() || (currentCity.province + currentCity.city + currentCity.district);
        
        if (!dateStr || !timeStr) {
            alert('请选择日期和时间');
            return;
        }
        
        var beijingTime = new Date(dateStr + 'T' + timeStr + ':00');
        var trueSolarTime = calculateTrueSolarTime(beijingTime, currentCity.lat, currentCity.lng);
        
        var question = $('#question').val();
        
        var url = '/api/qimen?' + $.param({
            timestamp: trueSolarTime.getTime(),
            location: location,
            lat: currentCity.lat,
            lng: currentCity.lng,
            type: $('#type').val(),
            method: $('#method').val(),
            purpose: $('#purpose').val(),
            question: question
        });
        
        window.location.href = '/custom?' + $.param({
            timestamp: trueSolarTime.getTime(),
            location: location,
            lat: currentCity.lat,
            lng: currentCity.lng,
            type: $('#type').val(),
            method: $('#method').val(),
            purpose: $('#purpose').val(),
            question: question,
            date: dateStr,
            time: timeStr
        });
    });
}

function maintainAspectRatio() {
    var gridWidth = $('.pan-grid').width();
    $('.gong').css('height', gridWidth / 3 + 'px');
}

function loadInitialPan() {
    var beijingTime = new Date();
    var trueSolarTime = calculateTrueSolarTime(beijingTime, currentCity.lat, currentCity.lng);
    var currentTimestamp = trueSolarTime.getTime();
    
    var urlParams = new URLSearchParams(window.location.search);
    var existingTimestamp = urlParams.get('timestamp');
    
    if (!existingTimestamp || Math.abs(currentTimestamp - parseInt(existingTimestamp)) > 1000) {
        window.location.href = '/?' + $.param({
            timestamp: currentTimestamp,
            location: currentCity.province + currentCity.city + currentCity.district,
            lat: currentCity.lat,
            lng: currentCity.lng
        });
    }
}

$(document).ready(function() {
    initCitySelectors();
    initRealTimePan();
    initCustomPan();
    maintainAspectRatio();
    $(window).resize(maintainAspectRatio);
    
    $('#cityDisplay').text(currentCity.province + currentCity.city + currentCity.district);
    
    loadInitialPan();
});