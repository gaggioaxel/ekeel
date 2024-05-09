package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Authorization;

import java.util.List;

public interface AuthorizationService {

    void saveAuthorization(Authorization authorization);
    Authorization getAuthorizationById(long id);
    Authorization getAuthorizationByName(String authorizationName);
    List<Authorization> getAllAuthorizations();
    void updateAuthorization(Authorization newAuthorization, Authorization oldAuthorization);
    void deleteAuthorizationById(long id);

}
