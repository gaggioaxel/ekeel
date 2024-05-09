package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Authorization;
import com.unige.encode.encoderestapi.model.User;
import com.unige.encode.encoderestapi.repository.UserRepository;
import com.unige.encode.encoderestapi.security.JwtUserFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.sql.Timestamp;
import java.util.List;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService, UserDetailsService {

    @Autowired private UserRepository userRepository;

    @Override
    public void saveUser(User user) {
        userRepository.save(user);
    }

    @Override
    public void saveUserSet(Set<User> users) {
        userRepository.saveAll(users);
    }

    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        User user = getUserByEmail(s);
        if(s==null){
            System.out.println("User not found in db");
            throw new UsernameNotFoundException("User not found in db");
        }
        else{
            System.out.println("User Found successfully");
        }
        return JwtUserFactory.create(user);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.getByEmail(email);
    }

    @Override
    public Set<User> getAllUsersByEmailInList(List<String> emails){
        return userRepository.getAllByEmailIn(emails);
    }

    @Override
    public List<User> getAllUsersByUsername(String username) {
        return userRepository.getAllByUsername(username);
    }

    @Override
    public List<User> getAllUsersByEnabled(boolean enabled) {
        return userRepository.getAllByEnabled(enabled);
    }

    @Override
    public List<User> getAllUsersByCreationDateAfter(Timestamp timestamp) {
        return userRepository.getAllByCreationDateAfter(timestamp);
    }

    @Override
    public List<User> getAllUsersByCreationDateBefore(Timestamp timestamp) {
        return userRepository.getAllByCreationDateBefore(timestamp);
    }

    @Override
    public List<User> getAllUsersByCreationDateBetween(Timestamp to, Timestamp from) {
        return userRepository.getAllByCreationDateBetween(to, from);
    }

    @Override
    public List<User> getAllUsersByAllUserAuthorizations_NameContains(String authorization) {
        return userRepository.getAllByAllUserAuthorizations_NameContains(authorization);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void updateUser(User newUser, User oldUser) {
        /*newUser.setEmail(oldUser.getEmail());
        newUser.setPassword(oldUser.getPassword());
        newUser.setUsername(oldUser.getUsername());
        newUser.setCreationDate(oldUser.getCreationDate());
        newUser.setEnabled(oldUser.getEnabled());
        newUser.setAllUserAuthorizations(oldUser.getAllUserAuthorizations());
        newUser.setAllUserTopicmaps(oldUser.getAllUserTopicmaps());*/
        saveUser(newUser);
    }

    @Transactional
    @Override
    public void deleteUserByEmail(String email) { userRepository.deleteByEmail(email); }

    @Override
    public boolean existsUserByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean isUserAdmin(String email){
        if(!existsUserByEmail(email)){
            return false;
        }
        List<User> admins = getAllUsersByAllUserAuthorizations_NameContains("ROLE_ADMIN");
        return admins.contains(getUserByEmail(email));
    }
}
