
exports.up = function(knex) {
  return knex.schema.alterTable('bets', (table)=>{
    table.string('team').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('bets')
};
