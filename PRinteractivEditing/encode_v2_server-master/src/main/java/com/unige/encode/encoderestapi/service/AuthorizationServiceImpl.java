package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Authorization;
import com.unige.encode.encoderestapi.repository.AuthorizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorizationServiceImpl implements AuthorizationService{

    @Autowired private AuthorizationRepository authorizationRepository;

    @Override
    public void saveAuthorization(Authorization authorization) {
        authorizationRepository.save(authorization);
    }

    @Override
    public Authorization getAuthorizationById(long id) {
        return authorizationRepository.getById(id);
    }

    @Override
    public Authorization getAuthorizationByName(String authorizationName) {
        return authorizationRepository.getByName(authorizationName);
    }

    @Override
    public List<Authorization> getAllAuthorizations() {
        return authorizationRepository.findAll();
    }

    @Override
    public void updateAuthorization(Authorization newAuthorization, Authorization oldAuthorization) {
        /*newAuthorization.setId(oldAuthorization.getId());
        newAuthorization.setName(oldAuthorization.getName());*/
        saveAuthorization(newAuthorization);
    }

    @Override
    public void deleteAuthorizationById(long id) {
        authorizationRepository.deleteById(id);
    }

}
