import java.io.*;

public class Main {
    public static void main() {
        String path = "KR_8217509265.txt";
        try {
            BufferedReader br = new BufferedReader(new FileReader(path));
            String st;

            while ((st = br.readLine()) != null) {
                System.out.println("working");
            }
        } catch (FileNotFoundException e) {
            System.out.println("File not found");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}