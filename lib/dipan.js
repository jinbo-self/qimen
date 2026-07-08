/**
 * 奇门遁甲地盘干设置模块
 * 地盘干根据局数排布，是固定不动的底盘
 */

// 三奇六仪顺序（9个）
const SAN_QI_LIU_YI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

// 洛书九宫飞宫顺序（不含中宫5）
// const LUO_SHU_ORDER = ['1', '8', '3', '4', '9', '2', '7', '6'];

/**
 * 根据阴阳遁和局数计算地盘干分布
 * @param {String} type 'yang' 阳遁 或 'yin' 阴遁
 * @param {Number} num 局数 (1-9)
 * @returns {Object} 地盘干分布
 */
function getDiPan(type, num) {
    const result = {};
    let currentGong = num;

    for (let i = 0; i < 9; i++) {
        result[currentGong.toString()] = SAN_QI_LIU_YI[i];

        if (type === 'yang') {
            currentGong++;
            if (currentGong > 9) currentGong = 1;  // 阳遁递增，超过9回1
        } else {
            currentGong--;
            if (currentGong === 0) currentGong = 9; // 阴遁递减，低于1回9
        }
    }
    return result;
}

/**
 * 获取基本地盘干分布（阳遁1局的默认分布，保留兼容性）
 * @returns {Object} 基本地盘干分布
 */
function getBasicDiPan() {
    return getDiPan('yang', 1);
}

/**
 * 获取飞宫地盘干（保留兼容性，实际调用 getDiPan）
 * @param {String} type 阴遁或阳遁
 * @param {Number} num 局数 (1-9)
 * @returns {Object} 调整后的地盘干分布
 */
function getFeiGongDiPan(type, num) {
    return getDiPan(type, num);
}

module.exports = {
    getBasicDiPan,
    getFeiGongDiPan,
    getDiPan
};
