
package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.repositories.UserRepository;
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
public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
    System.out.println("Checking user with phone: " + phone);
    TbUser user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with phone: " + phone));

    String password;
    if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
        System.out.println(" User has no password in DB, using default password 123456");
        password = new BCryptPasswordEncoder().encode("123456");
    } else {
        password = user.getPasswordHash();
    }

    return new org.springframework.security.core.userdetails.User(
            user.getPhone(),
            password,
            Collections.emptyList()
    );
}


}
