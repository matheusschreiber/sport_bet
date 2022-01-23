
exports.up = function(knex) {
  return knex.schema.createTable('bets', (table)=>{
    table.string('id').primary().notNullable();
    table.string('player').notNullable();
    table.float('odd').notNullable();
    table.integer('value').notNullable();
    table.boolean('outcome').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('bets')
};
