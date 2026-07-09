/**
 * 八门分布计算模块
 * 转盘排法：八门从值符宫整体转动到时干落宫
 */

// 洛书九宫顺序（不含中宫5）
const LUO_SHU_ORDER = ['1', '8', '3', '4', '9', '2', '7', '6'];

// 八门原位分布（按洛书顺序）
const BASIC_MEN = {
    '1': '休门',
    '8': '生门',
    '3': '伤门',
    '4': '杜门',
    '9': '景门',
    '2': '死门',
    '7': '惊门',
    '6': '开门',
    '5': '' // 中宫无门
};

/**
 * 排布八门（转盘排法）
 * @param {String} zhiFuGong 值符宫
 * @param {String} xunShouDiZhi 地支
 * @param {String} shiZhi 时支
 * @param {String} type 阴阳遁类型（可选，用于确定转动方向）
 * @returns {Object} 八门分布和值使信息
 */
function distributeBaMen(zhiFuGong, xunShouDiZhi, shiZhi, type) {
    // 1. 值使门 = 值符宫的原位门
    const zhiShiMen = BASIC_MEN[zhiFuGong] || '';

    // 2. 计算地支偏移（子=0, 丑=1, ..., 亥=11）
    const diZhiMap = { '子':0, '丑':1, '寅':2, '卯':3, '辰':4, '巳':5, '午':6, '未':7, '申':8, '酉':9, '戌':10, '亥':11 };
    const startIdx = diZhiMap[xunShouDiZhi];
    const currentIdx = diZhiMap[shiZhi];
    if (startIdx === undefined || currentIdx === undefined) {
        // 处理错误
        return { zhiShiGong: zhiFuGong, zhiShiMen, baMen: { ...BASIC_MEN } };
    }

    let diff = (currentIdx - startIdx + 12) % 12; // 地支差（0~11）
    let steps = diff % 8; // 八宫循环

    // 3. 根据阴阳遁确定移动方向，计算值使门落宫
    const startIndex = LUO_SHU_ORDER.indexOf(zhiFuGong);
    let zhiShiLuoIndex;
    if (type === 'yang') {
        zhiShiLuoIndex = (startIndex + steps) % 8;
    } else {
        zhiShiLuoIndex = (startIndex - steps + 8) % 8;
    }
    const zhiShiLuoGong = LUO_SHU_ORDER[zhiShiLuoIndex];

    // 4. 以值使门落宫为起点，顺时针排列八门
    const baMen = {};
    // 八门固定顺序（地盘顺序）
    const menOrder = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
    // 找到值使门在menOrder中的索引
    const startMenIdx = menOrder.indexOf(zhiShiMen);
    for (let i = 0; i < 8; i++) {
        const gongIdx = (zhiShiLuoIndex + i) % 8;
        const menIdx = (startMenIdx + i) % 8;
        const gong = LUO_SHU_ORDER[gongIdx];
        baMen[gong] = menOrder[menIdx];
    }

    baMen['5'] = ''; // 中宫无门

    return {
        zhiShiGong: zhiShiLuoGong,
        zhiShiMen,
        baMen
    };
}

module.exports = {
    distributeBaMen
};
