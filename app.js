const express = require('express');
const app = express();
const path = require('path');

const qimen = require('./lib/qimen');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));
app.disable('view cache');

function getDateFromTimestamp(timestamp) {
    if (timestamp && !isNaN(timestamp)) {
        return new Date(parseInt(timestamp));
    }
    return null;
}

function renderPan(res, date, options) {
    try {
        const qimenPan = qimen.calculate(date, options);

        if (!qimenPan.jiuGongAnalysis) {
            qimenPan.jiuGongAnalysis = {};
        }

        for (let i = 1; i <= 9; i++) {
            if (!qimenPan.jiuGongAnalysis[i]) {
                qimenPan.jiuGongAnalysis[i] = {
                    direction: '',
                    gongName: '',
                    jiXiong: 'ping'
                };
            }
        }

        res.locals.JIU_GONG = qimen.JIU_GONG;
        res.locals.JIU_XING = qimen.JIU_XING;
        res.locals.BA_MEN = qimen.BA_MEN;
        res.locals.BA_SHEN = qimen.BA_SHEN;

        res.render('index', {qimen: qimenPan});
    } catch (error) {
        console.error('排盘错误:', error);
        res.status(500).send('排盘错误: ' + error.message);
    }
}

app.get('/', (req, res) => {
    const timestamp = req.query.timestamp;
    const location = req.query.location || '四川省广安市广安区';
    
    const date = getDateFromTimestamp(timestamp);
    if (!date) {
        return res.status(400).send('请提供有效的时间戳');
    }

    const options = {
        type: '四柱',
        method: '时家',
        purpose: '综合',
        location: location
    };

    renderPan(res, date, options);
});

app.get('/custom', (req, res) => {
    const type = req.query.type || '四柱';
    const method = req.query.method || '时家';
    const purpose = req.query.purpose || '综合';
    const location = req.query.location || '四川省广安市广安区';
    const timestamp = req.query.timestamp;

    const date = getDateFromTimestamp(timestamp);
    if (!date) {
        return res.status(400).send('请提供有效的时间戳');
    }

    const options = {
        type,
        method,
        purpose,
        location
    };

    renderPan(res, date, options);
});

app.get('/api/qimen', (req, res) => {
    const type = req.query.type || '四柱';
    const method = req.query.method || '时家';
    const purpose = req.query.purpose || '综合';
    const location = req.query.location || '四川省广安市广安区';
    const timestamp = req.query.timestamp;

    const date = getDateFromTimestamp(timestamp);
    if (!date) {
        return res.status(400).json({error: '请提供有效的时间戳'});
    }

    try {
        const options = {
            type,
            method,
            purpose,
            location
        };

        const qimenPan = qimen.calculate(date, options);

        if (!qimenPan.jiuGongAnalysis) {
            qimenPan.jiuGongAnalysis = {};
        }

        for (let i = 1; i <= 9; i++) {
            if (!qimenPan.jiuGongAnalysis[i]) {
                qimenPan.jiuGongAnalysis[i] = {
                    direction: '',
                    gongName: '',
                    jiXiong: 'ping'
                };
            }
        }

        res.json(qimenPan);
    } catch (error) {
        console.error('API排盘错误:', error);
        res.status(500).json({error: '排盘错误', message: error.message});
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`奇门遁甲排盘系统正在运行，请访问 http://localhost:${port}`);
});