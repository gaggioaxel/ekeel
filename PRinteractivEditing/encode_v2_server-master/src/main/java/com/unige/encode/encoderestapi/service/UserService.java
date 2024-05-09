package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.User;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;

public interface UserService {

    void saveUser(User user);
    void saveUserSet(Set<User> users);
    User getUserByEmail(String email);
    Set<User> getAllUsersByEmailInList(List<String> emails);
    List<User> getAllUsersByUsername(String username);
    List<User> getAllUsersByEnabled(boolean enabled);
    List<User> getAllUsersByCreationDateAfter(Timestamp timestamp);
    List<User> getAllUsersByCreationDateBefore(Timestamp timestamp);
    List<User> getAllUsersByCreationDateBetween(Timestamp to, Timestamp from);
    List<User> getAllUsersByAllUserAuthorizations_NameContains(String authorization);
    List<User> getAllUsers();
    void updateUser(User newUser, User oldUser);
    void deleteUserByEmail(String email);
    boolean existsUserByEmail(String email);
    boolean isUserAdmin(String email);

}
