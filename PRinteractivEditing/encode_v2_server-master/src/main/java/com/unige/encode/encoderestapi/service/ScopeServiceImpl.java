package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Scope;
import com.unige.encode.encoderestapi.repository.ScopeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ScopeServiceImpl implements ScopeService{

    @Autowired private ScopeRepository scopeRepository;

    @Override
    public void saveScope(Scope scope) {
        scopeRepository.save(scope);
    }

    @Override
    public void saveAllScopes(List<Scope> scopes) {
        scopeRepository.saveAll(scopes);
    }

    /*@Override
    public List<Scope> getAllScopesByTopicId(long id) {
        return scopeRepository.getAllByTopicId(id);
    }

    @Override
    public List<Scope> getAllScopesByOccurrenceId(long id) {
        return scopeRepository.getAllByOccurrenceId(id);
    }

    @Override
    public List<Scope> getAllScopesByAssociationId(long id) {
        return scopeRepository.getAllByLinkedTopicsId(id);
    }

    @Override
    public void deleteScopeById(long id) {
        scopeRepository.deleteById(id);
    }

    @Override
    public void deleteAllScopesByTopicId(long id) {
        scopeRepository.deleteAllByTopicId(id);
    }

    @Override
    public void deleteAllScopesByAssociationId(long id) {
        scopeRepository.deleteAllByLinkedTopicsId(id);
    }

    @Override
    public void deleteAllScopesByOccurrenceId(long id) {
        scopeRepository.deleteAllByOccurrenceId(id);
    }

    @Override
    public void saveScope(Scope scope) {
        scopeRepository.save(scope);
    }*/

    @Override
    public Scope getScopeById(long id) { return scopeRepository.getById(id); }

    @Override
    public List<Scope> getBySchemaIdIsIn(Set<Long> schemaIds){
        return scopeRepository.getBySchemaIdIsIn(schemaIds);
    }

    @Override
    public void updateScope(Scope newScope, Scope oldScope) {
        oldScope.setName(newScope.getName());
        oldScope.setDescription(newScope.getDescription());
        saveScope(oldScope);
    }

    @Override
    public void deleteScope(long scopeId) {
        scopeRepository.deleteById(scopeId);
    }

    @Override
    public boolean existsScopeById(long id) {
        return scopeRepository.existsById(id);
    }

    @Override
    public List<Scope> getAllScopes() { return scopeRepository.findAll();}

}
