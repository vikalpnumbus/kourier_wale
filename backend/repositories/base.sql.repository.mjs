export class BaseRepositoryClass {
  constructor(model) {
    this.model = model;
  }
  // Count documents
  async countDocuments(condition) {
    return await this.model.count({ where: condition });
  }

  async find(condition = {}, constraints = {}) {
    let { page = 1, limit = 50, order = [["id", "DESC"]] } = constraints;
    page = Math.max(1, page);
    limit = Math.min(500, limit);
    let offset = (page - 1) * limit;

    return await this.model.findAll({
      where: condition,
      limit,
      offset,
      order,
    });
  }

  async findOne(condition) {
    if (condition.hasOwnProperty("where"))
      return await this.model.findOne(condition);
    else return (await this.model.findOne({ where: condition }))?.dataValues;
  }

  async findOneAndDelete(condition) {
    const record = await this.model.findOne({ where: condition });
    if (!record) return null;

    await record.destroy();
    return record.dataValues; // return deleted record
  }

  // Update one by condition
  async findOneAndUpdate(condition, data) {
    const record = await this.model.findOne({ where: condition });
    if (!record) return null;
    return (await record.update(data))?.dataValues;
  }

  async save(data) {
    return (await this.model.create(data))?.dataValues;
  }
  async bulkSave(data) {
    return (await this.model.bulkCreate(data))?.dataValues;
  }

  // Update many (bulk update)
  async updateMany(condition, data) {
    const [updated] = await this.model.update(data, {
      where: condition,
    });
    return updated; // returns number of rows updated
  }

  async deleteMany(condition) {
    return await this.model.destroy({ where: condition });
  }
}
