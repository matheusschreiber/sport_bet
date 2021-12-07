
exports.up = function(knex) {
  return knex.schema.createTable('seasons', function(table){
    table.string('id').primary().notNullable();
    table.string('team_name').notNullable();
    table.string('placement').notNullable();
    table.float('season_score').notNullable();
    table.string('biggest_opponent').notNullable();
    table.string('least_opponent').notNullable();
    table.integer('wins').notNullable();
    table.integer('dues').notNullable();
    table.integer('losses').notNullable();
    table.integer('games').notNullable();
    table.integer('fans').notNullable();
    table.integer('goalsfor').notNullable();
    table.integer('goalsagainst').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('seasons')
};

