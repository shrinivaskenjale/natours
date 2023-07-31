class QueryBuilder {
  constructor(model, queryParameters) {
    this.model = model;
    // Create instance of query
    this.query = model.find();
    this.queryParameters = queryParameters;
  }

  // ==================
  // Filtering
  // ==================

  /**
   * We filter the data by passing filter using query parameters.
   * ?difficulty=easy&duration=5
   *
   * Query parameters can include other paramters which are not related to filtering, like for pagination. We should separate the filter parameters on server dynamically as we don't know in advance exactly which filter query parameters will request have.
   * ?difficulty=easy&duration=5&sort=asc&page=3
   *
   * Advanced filtering:
   * To filter documents using other operators (like >= or <), standard way is to use square brackets in query string.
   * ?duration[gte]=5 => { duration: { gte: '5' } }
   * Above query filters the tours with duration greater than or equal to 5 days.
   *
   * Query string containing square brackets creates nested req.query object which is similar to mongodb filter object.
   * Mongodb filter operators have $ sign in front of them. So, convert filter object to match that syntax.
   *
   * Query string containing property appearing more than once creates a array in express.
   * ?duration=5&duration=9 => { duration: ['5', '9'] }
   *
   * Even if same field appears multiple times in query string with different operators, express smartly combines them.
   * ?price[lt]=1500&price[gt]=300
   * { price: { lt: '1500', gt: '300' } }
   */
  filter() {
    const { page, sort, limit, fields, ...filterParameters } =
      this.queryParameters;
    let filterString = JSON.stringify(filterParameters);
    // Following regex replaces all specified strings only if thery are one word. So no problem if any of these strings are part of words.
    filterString = filterString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    const filter = JSON.parse(filterString);
    this.query = this.query.find(filter);
    // Return 'this' so that we can chain multiple methods.
    return this;
  }

  // ==================
  // Sorting
  // ==================

  /**
   * Query parameter 'sort' contains the field to sort with.
   * ?sort=price
   *
   * If sort value has '-' in front of it, mongoose sorts that field in descending order.
   * ?sort=-price
   *
   * We can specify multiple fields separated by space. If value of field of 2 or more documents is same then order is decided using next field.
   * To pass multiple fields in query string, separate them with comma(,).
   * ?sort=-price,ratingsAverage
   *
   * We have to replace comma with space.
   */

  sort() {
    let { sort } = this.queryParameters;
    if (sort) {
      sort = sort.replaceAll(",", " ") + " _id";
    } else {
      sort = "-createdAt _id";
    }
    this.query = this.query.sort(sort);
    return this;
  }

  // ==================
  // Limiting fields / Projection
  // ==================
  /**
   * Limiting fields helps to save bandwidth.
   *
   * 'fields' query parameter has comma(,) separated list of fields required in response.
   * ?fields=name,duration,difficulty,price
   *
   * select() method on query object takes space separated list of fields.
   *
   * _id field is added automatically.
   *
   * Instead of specifying fields to be included, we can specify fields to be excluded by prefixing them with - sign.
   * ?fields=-name,-duration
   *
   * Alternatively, 'select' SchemaType specifies default projections for queries, which takes boolean value.
   * If select schema type is set to false, then you need to include this field when querying documents explicitly by using + sign.
   * .select("+hiddenField")
   */

  select() {
    let { fields } = this.queryParameters;
    if (fields) {
      fields = fields.replaceAll(",", " ");
    } else {
      // Mongoose adds __v field.
      fields = "-__v";
    }
    this.query = this.query.select(fields);
    return this;
  }

  // ==================
  // Pagination
  // ==================
  /**
   * Query parameter 'page' specifies requested page and 'limit' specifies no. of records per page.
   * ?limit=3&page=1
   *
   * We have to skip ('page'-1)*'limit' no. of records from DB and query next 'limit' no. of records.
   *
   * If user requests a page that does not exist then throw error.
   *
   * If using skip() with sort(), be sure to include at least one field in your sort that contains unique values, before passing results to skip(). This avoids inconsistent results.
   */

  paginate() {
    // Convert query parameters to number and set default values
    let { page, limit } = this.queryParameters;
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skipCount = (page - 1) * limit;
    this.query = this.query.skip(skipCount).limit(limit);

    // if (page) {
    //   const documentsCount = await this.model.countDocuments();
    //   if (skipCount >= documentsCount) {
    //     throw new Error("This page does not exist.");
    //   }
    // }

    return this;
  }
}

module.exports = QueryBuilder;
