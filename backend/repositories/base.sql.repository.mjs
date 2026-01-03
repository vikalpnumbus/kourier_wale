export class BaseRepositoryClass {
  constructor(model) {
    this.model = model;
  }
  // Count documents
  async countDocuments(condition, options = {}) {
    return await this.model.count({ where: condition, ...options });
  }

  async find(condition = {}, constraints = {}, include = [], raw = false, options = {}) {
    let { page = 1, limit = 50, order = [["id", "DESC"]] } = constraints;
    page = Math.max(1, page);
    limit = Math.min(500, limit);
    let offset = (page - 1) * limit;

    const payload = {
      where: condition,
      include,
      limit,
      offset,
      order,
      raw,
      ...options,
    };
    return await this.model.findAll(payload);
  }

  async findOne(condition, include = []) {
    if (condition.hasOwnProperty("where")) return await this.model.findOne(condition);
    else return (await this.model.findOne({ where: condition, include }))?.dataValues;
  }

  async findOneAndDelete(condition) {
    const record = await this.model.findOne({ where: condition });
    if (!record) return null;

    await record.destroy();
    return record.dataValues; // return deleted record
  }

  // Update one by condition
  async findOneAndUpdate(condition, data, options = {}) {
    const record = await this.model.findOne({ where: condition, ...options });
    if (!record) return null;
    return (await record.update(data))?.dataValues;
  }

  async save(data) {
    return (await this.model.create(data))?.dataValues;
  }
  async bulkSave(data, options = {}) {
    return (await this.model.bulkCreate(data, options))?.dataValues;
  }

  // Update many (bulk update)
  async updateMany(condition, data, options = {}) {
    const [updated] = await this.model.update(data, {
      where: condition,
      ...options,
    });
    return updated; // returns number of rows updated
  }

  async deleteMany(condition, options = {}) {
    return await this.model.destroy({ where: condition, ...options });
  }
}
