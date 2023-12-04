require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
});

const Theme = sequelize.define(
    'Theme',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoincrement: true
        },
        name: Sequelize.STRING
    },
    {
        createdAt: false,
        updatedAt: false
    }
);

const Set = sequelize.define(
    'Set',
    {
        set_num: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING
    },
    {
        createdAt: false,
        updatedAt: false
    }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'});

const initialize = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.sync();
            console.log(`[set => initialize] Successfully access DB`);
            resolve();
        } catch (err) {
            console.log(`[set => initialize] Fail to initialize: ${err}`);
            reject(err);
        }
    });
};

const getAllSets = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Set.findAll({
                include: [Theme]
            });
            console.log('[getAllSets] Successfully retrieved');
            resolve(result);
        } catch(err) {
            console.log(`[getAllSets] Error: ${err}`);
            reject(err);
        }
    });
};

const getSetByNum = (setNum) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Set.findAll({
                include: [Theme],
                where: {
                    set_num: setNum
                }
            });
            if (!result || (result && !Array.isArray(result)) || (result && Array.isArray(result) && result.length < 1)) throw "Unable to find requested sets";
            console.log('[getSetByNum] Successfully retrieved');
            resolve(result[0]);
        } catch(err) {
            console.log(`[getSetByNum] Error: ${err}`);
            reject(err);
        }
    });
};

const getSetsByTheme = (theme) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Set.findAll({
                include: [Theme],
                where: {
                    '$Theme.name$': {
                        [Sequelize.Op.iLike]: `%${theme}%`
                    }
                }
            });
              
            if (!result || (result && !Array.isArray(result)) || (result && Array.isArray(result) && result.length < 1)) throw "Unable to find requested sets";
            console.log('[getSetsByTheme] Successfully retrieved');
            resolve(result);
        } catch(err) {
            console.log(`[getSetsByTheme] Error: ${err}`);
            reject(err);
        }
    });
};

const getAllThemes = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Theme.findAll({});
            console.log('[getAllThemes] Successfully retrieved');
            resolve(result);
        } catch(err) {
            console.log(`[getAllThemes] Error: ${err}`);
            reject(err);
        }
    });
};

const addSet = (setData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await Set.create(setData);
            console.log('[addSet] Successfully inserted');
            console.log(JSON.stringify(res, null, 2));
            resolve();
        } catch(err) {
            const msg = err.errors[0].message;
            console.log(`[addSet] Error: ${msg}`);
            reject(msg);
        }
    });
};

const editSet = (set_num, setData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await Set.update(setData, { where: { set_num } });
            console.log('[editSet] Successfully updated');
            resolve();
        } catch(err) {
            console.log(err);
            const msg = err.errors[0].message;
            console.log(`[editSet] Error: ${msg}`);
            reject(msg);
        }
    });
};

const deleteSet = (set_num) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Set.destroy({ where: { set_num } });
            console.log('[deleteSet] Successfully deleted');
            resolve();
        } catch(err) {
            const msg = err.errors[0].message;
            console.log(`[deleteSet] Error: ${msg}`);
            reject(msg);
        }
    });
};

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    addSet,
    editSet,
    deleteSet
};
