
exports.up = function(knex) {
  return knex.schema.createTable('matches', (table)=>{
    table.string('id').primary().notNullable();
    table.string('year').notNullable();
    table.string('team_A').notNullable();
    table.string('score_A').notNullable();
    table.string('score_B').notNullable();
    table.string('team_B').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('matches')
};
