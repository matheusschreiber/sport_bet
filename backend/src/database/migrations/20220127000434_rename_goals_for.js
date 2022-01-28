
exports.up = function(knex) {
  return knex.schema.alterTable('teams', (table)=>{
    table.renameColumn('goalsfor', 'goals_for')
    table.renameColumn('goalsagainst', 'goals_against')
  })
};

exports.down = function(knex) {
  
};
