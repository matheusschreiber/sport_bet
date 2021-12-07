
exports.up = function(knex) {
  return knex.schema.createTable('teams', function(table){
    table.string('name').primary().notNullable();
    table.string('acronym').notNullable();
    table.integer('wins').notNullable();
    table.integer('dues').notNullable();
    table.integer('losses').notNullable();
    table.integer('games').notNullable();
    table.integer('fans').notNullable();
    table.integer('goalsfor').notNullable();
    table.integer('goalsagainst').notNullable();
    table.integer('winstreak').notNullable();
    table.integer('alltimerecord').notNullable();
    table.integer('titles').notNullable();
    table.integer('vices').notNullable();
    table.string('jersey').notNullable();
    table.string('country').notNullable();
    table.string('biggest_opponent');
    table.string('biggest_opponent_score');
    table.string('least_opponent');
    table.string('least_opponent_score');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('teams');
};
