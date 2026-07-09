/**
 * 九星分布计算模块
 * 转盘排法：九星从值符宫整体转动到时干落宫
 */

// 洛书九宫顺序（不含中宫5）
const LUO_SHU_ORDER = ['1', '8', '3', '4', '9', '2', '7', '6'];

// 九星原位分布
const BASIC_XING = {
    '1': '天蓬',
    '8': '天任',
    '3': '天冲',
    '4': '天辅',
    '9': '天英',
    '2': '天芮',
    '7': '天柱',
    '6': '天心',
    '5': '天禽'  // 中宫
};

/**
 * 排布九星（转盘排法）
 * @param {Object} diPan 地盘干分布
 * @param {String} xunShou 旬首六仪
 * @param {String} shiGan 时干（可选，用于计算转动）
 * @returns {Object} 九星分布和值符信息
 */
function distributeJiuXing(diPan, xunShou, shiGan, type) {
    // 1. 找值符宫
    let zhiFuGong = '';
    for (const gong in diPan) {
        if (diPan[gong] === xunShou && gong !== '5') {
            zhiFuGong = gong;
            break;
        }
    }
    if (!zhiFuGong) zhiFuGong = '2';

    const zhiFuXing = BASIC_XING[zhiFuGong];

    if (!shiGan) {
        return { zhiFuGong, zhiFuXing, jiuXing: { ...BASIC_XING } };
    }

    // 2. 找时干落宫
    let luoGong = '';
    for (const gong in diPan) {
        if (diPan[gong] === shiGan && gong !== '5') {
            luoGong = gong;
            break;
        }
    }
    if (!luoGong) luoGong = zhiFuGong; // 甲隐于六仪

    const zhiFuIndex = LUO_SHU_ORDER.indexOf(zhiFuGong);
    const luoGongIndex = LUO_SHU_ORDER.indexOf(luoGong);
    if (zhiFuIndex === -1 || luoGongIndex === -1) {
        return { zhiFuGong, zhiFuXing, jiuXing: { ...BASIC_XING } };
    }

    // 3. 计算步数（阳顺阴逆）
    let steps;
    if (type === 'yang') {
        steps = (luoGongIndex - zhiFuIndex + 8) % 8;
    } else {
        steps = (zhiFuIndex - luoGongIndex + 8) % 8;
    }

    // 4. 旋转九星（方向与天盘干完全一致）
    const jiuXing = {};
    for (let i = 0; i < 8; i++) {
        const originalGong = LUO_SHU_ORDER[i];
        const originalXing = BASIC_XING[originalGong];
        let newIndex;
        if (type === 'yang') {
            newIndex = (i + steps) % 8;
        } else {
            newIndex = (i - steps + 8) % 8;
        }
        const newGong = LUO_SHU_ORDER[newIndex];
        jiuXing[newGong] = originalXing;
    }

    // 5. 处理天禽寄宫（与天盘干寄宫对称）
    let tianRuiGong = '';
    for (const gong in jiuXing) {
        if (jiuXing[gong] === '天芮') {
            tianRuiGong = gong;
            break;
        }
    }
    if (!tianRuiGong) tianRuiGong = '2'; // 保底
    jiuXing[tianRuiGong] = '天芮、天禽';

    jiuXing['5'] = '';

    return {
        zhiFuGong,
        zhiFuLuoGong: luoGong,
        zhiFuXing,
        jiuXing
    };
}

module.exports = {
    distributeJiuXing
};
