
exports.up = function(knex) {
  return knex.schema.createTable('players', (table)=>{
    table.string('id').primary().notNullable();
    table.string('name').notNullable();
    table.float('wallet')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('players')
};
