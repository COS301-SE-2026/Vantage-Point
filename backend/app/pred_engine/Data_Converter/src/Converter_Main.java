import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;

public class Converter_Main {
    public static void main() {
        String path = "match_files/KR_8217431121.txt";
        ObjectMapper mapper = new ObjectMapper();
        try {
            File jsonFile = new File(path);
            MatchObj match = mapper.readValue(jsonFile, MatchObj.class);
            System.out.println(match.metadata.matchId);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}