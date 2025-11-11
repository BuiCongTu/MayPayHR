
package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
@Override
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    System.out.println("Checking user with email: " + email);
    TbUser user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

    return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPasswordHash(), // dùng hash đã có trong DB
            Collections.emptyList()
    );
}
}
