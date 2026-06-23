import java.util.regex.*;

public class RegexTest {
    public static void main(String[] args) {
        String pattern = "^(?:https?:\\/\\/)?(?:www\\.|m\\.)?(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=|shorts\\/))((\\w|-){11})(?:\\S+)?$";
        Pattern p = Pattern.compile(pattern);
        String[] urls = {
            "https://youtube.com/shorts/FHEtuI0I9og",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ",
            "https://youtube.com/shorts/FHEtuI0I9og?feature=share"
        };
        for (String url : urls) {
            Matcher m = p.matcher(url);
            if (m.find()) {
                System.out.println("Match for " + url + " -> " + m.group(1));
            } else {
                System.out.println("NO MATCH for " + url);
            }
        }
    }
}
