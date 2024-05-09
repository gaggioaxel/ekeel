package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Scope;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ScopeService {

    void saveScope(Scope scope);
    void saveAllScopes(List<Scope> scopes);
    Scope getScopeById(long scopeId);
   /* List<Scope> getAllScopesByTopicId(long id);
    List<Scope> getAllScopesByOccurrenceId(long id);
    List<Scope> getAllScopesByAssociationId(long id);
    void deleteScopeById(long id);
    void deleteAllScopesByTopicId(long id);
    void deleteAllScopesByAssociationId(long id);
    void deleteAllScopesByOccurrenceId(long id);*/
    List<Scope> getAllScopes();
    List<Scope> getBySchemaIdIsIn(Set<Long> schemaIds);
    void updateScope(Scope newScope, Scope oldScope);
    void deleteScope(long scopeId);
    boolean existsScopeById(long id);
}
