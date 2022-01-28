
exports.up = function(knex) {
  return knex.schema.createTable('bets', (table)=>{
    table.string('id').primary().notNullable();
    table.string('player').notNullable();
    table.float('odd').notNullable();
    table.integer('value').notNullable();
    table.boolean('outcome').notNullable();
    table.string('description').notNullable();
    table.string('year').notNullable();
    table.string('team').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('bets')
};
