var currentCity = JSON.parse(localStorage.getItem('qimen_city')) || DEFAULT_CITY;
var aiAnalysisRequest = null;

function overallAnalysis(jiuGongAnalysis, zhiFuGong, zhiShiGong, purpose) { 
    var zhiFuJiXiong = jiuGongAnalysis[zhiFuGong] ? jiuGongAnalysis[zhiFuGong].jiXiong : 'ping'; 
    var zhiShiJiXiong = jiuGongAnalysis[zhiShiGong] ? jiuGongAnalysis[zhiShiGong].jiXiong : 'ping'; 
     
    var overallJiXiong; 
    if (zhiFuJiXiong === 'da_ji' && zhiShiJiXiong === 'da_ji') { 
        overallJiXiong = 'da_ji'; 
    } else if (zhiFuJiXiong.includes('ji') && zhiShiJiXiong.includes('ji')) { 
        overallJiXiong = 'xiao_ji'; 
    } else if (zhiFuJiXiong.includes('xiong') && zhiShiJiXiong.includes('xiong')) { 
        overallJiXiong = 'da_xiong'; 
    } else if (zhiFuJiXiong.includes('xiong') || zhiShiJiXiong.includes('xiong')) { 
        overallJiXiong = 'xiao_xiong'; 
    } else { 
        overallJiXiong = 'ping'; 
    } 
     
    var bestGong = ''; 
    var bestScore = -3; 
     
    for (var gong in jiuGongAnalysis) { 
        var analysis = jiuGongAnalysis[gong]; 
        var score = 0; 
         
        switch (analysis.jiXiong) { 
            case 'da_ji': score += 2; break; 
            case 'xiao_ji': score += 1; break; 
            case 'ping': break; 
            case 'xiao_xiong': score -= 1; break; 
            case 'da_xiong': score -= 2; break; 
        } 
         
        if (purpose === '事业' && ['1', '6', '9'].includes(gong)) { 
            score += 1; 
        } else if (purpose === '财运' && ['1', '7', '6'].includes(gong)) { 
            score += 1; 
        } else if (purpose === '婚姻' && ['2', '7', '9'].includes(gong)) { 
            score += 1; 
        } else if (purpose === '健康' && ['3', '9', '4'].includes(gong)) { 
            score += 1; 
        } else if (purpose === '学业' && ['4', '9', '3'].includes(gong)) { 
            score += 1; 
        } 
         
        if (score > bestScore) { 
            bestScore = score; 
            bestGong = gong; 
        } 
    } 
     
    var suggestions = []; 
     
    switch (overallJiXiong) { 
        case 'da_ji': 
            suggestions.push("当前时运极佳，可大胆行事，推进重要计划。"); 
            suggestions.push("贵人运强，适合社交活动和寻求支持。"); 
            suggestions.push("财运亨通，可考虑投资或财务规划。"); 
            break; 
        case 'xiao_ji': 
            suggestions.push("时运较好，可稳步推进计划，但需谨慎。"); 
            suggestions.push("有贵人相助，但也需自身努力。"); 
            suggestions.push("财运平稳，宜守不宜进。"); 
            break; 
        case 'ping': 
            suggestions.push("时运平平，宜按部就班行事，不宜冒险。"); 
            suggestions.push("人际关系一般，需多加维护。"); 
            suggestions.push("财运一般，宜节制开支。"); 
            break; 
        case 'xiao_xiong': 
            suggestions.push("时运不佳，宜守不宜进，避免冒险。"); 
            suggestions.push("谨防小人，保持低调。"); 
            suggestions.push("财务宜节约，避免大额支出。"); 
            break; 
        case 'da_xiong': 
            suggestions.push("当前时运不佳，宜避开重要活动，保持低调。"); 
            suggestions.push("谨防小人和突发事件，避免冲突。"); 
            suggestions.push("财务宜严格控制，避免任何投资和大额支出。"); 
            break; 
    } 
     
    if (bestGong) { 
        var bestGongInfo = jiuGongAnalysis[bestGong]; 
        suggestions.push("最有利方位在" + (bestGongInfo.direction || '') + "方(" + (bestGongInfo.gongName || '') + "宫)，可多往此方位活动。"); 
         
        if (purpose === '事业') { 
            suggestions.push("事业方面，注重稳扎稳打，积累经验和人脉，时机成熟再大展拳脚。"); 
        } else if (purpose === '财运') { 
            suggestions.push("财运方面，建议稳健理财，避免投机，重视积累和长期规划。"); 
        } else if (purpose === '婚姻') { 
            suggestions.push("婚姻方面，注重沟通和理解，创造和谐的家庭氛围。"); 
        } else if (purpose === '健康') { 
            suggestions.push("健康方面，注意作息规律，适当运动，保持心情愉快。"); 
        } else if (purpose === '学业') { 
            suggestions.push("学业方面，制定合理计划，坚持不懈，善于利用资源和请教他人。"); 
        } 
    } 
     
    return { 
        overallJiXiong: overallJiXiong, 
        overallJiXiongText: { 
            'da_ji': '大吉', 
            'xiao_ji': '小吉', 
            'ping': '平', 
            'xiao_xiong': '小凶', 
            'da_xiong': '大凶' 
        }[overallJiXiong], 
        bestGong: bestGong, 
        suggestions: suggestions 
    }; 
}

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

function updatePan(timestamp, city, purpose, question) {
    var url = '/api/qimen?' + $.param({
        timestamp: timestamp,
        location: city.province + city.city + city.district,
        lat: city.lat,
        lng: city.lng,
        purpose: purpose || '综合',
        skipAnalysis: true
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
        
        updateLocalAnalysis(data, purpose || '综合');
        
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
        
        callAiAnalysis(data, purpose || '综合', question || '');
    }).fail(function() {
        alert('获取排盘数据失败');
    });
}

function updateLocalAnalysis(qimenResult, purpose) {
    var analysis = overallAnalysis(qimenResult.jiuGongAnalysis, qimenResult.zhiFuGong, qimenResult.zhiShiGong, purpose);
    
    $('#overallLuck').removeClass('da_ji xiao_ji ping xiao_xiong da_xiong');
    $('#overallLuck').addClass(analysis.overallJiXiong || 'ping');
    $('#overallLuck').text(analysis.overallJiXiongText || '平');
    
    $('.panel-primary .panel-body .suggestion-list').remove();
    
    if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
        var suggestionsHtml = '<strong>建议:</strong><ul class="suggestion-list">';
        analysis.suggestions.forEach(function(suggestion) {
            suggestionsHtml += '<li>' + suggestion + '</li>';
        });
        suggestionsHtml += '</ul>';
        $('.panel-primary .panel-body').append(suggestionsHtml);
    }
}

function cancelAiAnalysis() {
    if (aiAnalysisRequest) {
        aiAnalysisRequest.abort();
        aiAnalysisRequest = null;
    }
    $('#aiLoading').hide();
}

function callAiAnalysis(qimenResult, purpose, question) {
    cancelAiAnalysis();
    
    $('#aiLoading').css('display', 'flex');
    $('#aiAnalysisResult').html('<p class="text-center text-muted">AI分析正在加载中...</p>');
    
    aiAnalysisRequest = $.ajax({
        url: '/api/ai-analysis',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            qimenResult: qimenResult,
            purpose: purpose,
            question: question
        }),
        success: function(response) {
            aiAnalysisRequest = null;
            $('#aiLoading').hide();
            
            if (response.success && response.analysis) {
                var analysis = response.analysis;
                
                $('#overallLuck').removeClass('da_ji xiao_ji ping xiao_xiong da_xiong');
                $('#overallLuck').addClass(analysis.overallJiXiong || 'ping');
                $('#overallLuck').text(analysis.overallJiXiongText || '平');
                
                if (analysis.aiAnalysis) {
                    var formattedHtml = formatMarkdown(analysis.aiAnalysis);
                    $('#aiAnalysisResult').html(formattedHtml);
                }
                
                if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
                    $('.panel-primary .panel-body .suggestion-list').remove();
                    var suggestionsHtml = '<strong>建议:</strong><ul class="suggestion-list">';
                    analysis.suggestions.forEach(function(suggestion) {
                        suggestionsHtml += '<li>' + suggestion + '</li>';
                    });
                    suggestionsHtml += '</ul>';
                    $('.panel-primary .panel-body').append(suggestionsHtml);
                }
            }
        },
        error: function(xhr) {
            aiAnalysisRequest = null;
            if (xhr.statusText !== 'abort') {
                $('#aiLoading').hide();
                $('#aiAnalysisResult').html('<p class="text-center text-danger">AI分析失败，请稍后重试</p>');
            }
        }
    });
}

function formatMarkdown(text) {
    if (!text) return '';
    
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        return '<pre><code>' + code.trim() + '</code></pre>';
    });
    
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');
    
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/<\/li><br><li>/g, '</li><li>');
    text = text.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    text = text.replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>');
    text = text.replace(/(<li>\d+\. .*<\/li>)/g, '<ol>$1</ol>');
    
    text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    
    text = text.replace(/(?<!\w)\*(?!\w)/g, '');
    
    text = text.replace(/[*]{2,}/g, '');
    
    text = text.replace(/\*([^\*\s]+)\*/g, '$1');
    
    text = text.replace(/<br><br>/g, '</p><p>');
    
    text = text.replace(/<\/p><p><\/p><p>/g, '</p><p>');
    
    return '<p>' + text + '</p>';
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
        updatePan(trueSolarTime.getTime(), currentCity, '综合', '');
    });
}

function initRealTimePan() {
    $('#realtimePan').click(function(e) {
        e.preventDefault();
        var beijingTime = new Date();
        var trueSolarTime = calculateTrueSolarTime(beijingTime, currentCity.lat, currentCity.lng);
        updatePan(trueSolarTime.getTime(), currentCity, '综合', '');
    });
}

function initCustomPan() {
    var now = new Date();
    var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    var timeStr = String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');
    
    var savedData = localStorage.getItem('qimen_custom_pan');
    if (savedData) {
        try {
            savedData = JSON.parse(savedData);
            $('#type').val(savedData.type || '四柱');
            $('#method').val(savedData.method || '时家');
            $('#date').val(savedData.date || dateStr);
            $('#time').val(savedData.time || timeStr);
            $('#location').val(savedData.location || '');
            $('#purpose').val(savedData.purpose || '综合');
            $('#question').val(savedData.question || '');
        } catch (e) {
            $('#date').val(dateStr);
            $('#time').val(timeStr);
        }
    } else {
        $('#date').val(dateStr);
        $('#time').val(timeStr);
    }
    
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
        
        var customPanData = {
            type: $('#type').val(),
            method: $('#method').val(),
            date: dateStr,
            time: timeStr,
            location: $('#location').val(),
            purpose: $('#purpose').val(),
            question: question
        };
        localStorage.setItem('qimen_custom_pan', JSON.stringify(customPanData));
        
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
    var purpose = urlParams.get('purpose') || '综合';
    var question = urlParams.get('question') || '';
    
    if (!existingTimestamp) {
        window.location.href = '/?' + $.param({
            timestamp: currentTimestamp,
            location: currentCity.province + currentCity.city + currentCity.district,
            lat: currentCity.lat,
            lng: currentCity.lng,
            purpose: purpose,
            question: question
        });
    } else {
        updatePan(parseInt(existingTimestamp), currentCity, purpose, question);
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