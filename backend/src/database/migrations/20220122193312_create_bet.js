
exports.up = function(knex) {
  return knex.schema.createTable('bets', (table)=>{
    table.string('id').primary().notNullable();
    table.string('player').notNullable();
    table.float('odd').notNullable();
    table.float('value').notNullable();
    table.float('profit').notNullable();
    table.boolean('outcome').notNullable();
    table.string('description').notNullable();
    table.string('year').notNullable();
    table.string('team').notNullable();
    table.string('fase').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('bets')
};
