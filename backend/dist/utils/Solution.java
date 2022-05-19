import java.util.*;

public class Solution{
    public static void main (String[] args) {
        Scanner sc=new Scanner(System.in);
        int t=sc.nextInt();
        while(t-->0){
            int n=sc.nextInt();
            int product=1;
            for(int i=1;i<=n;i++){
                product*=i;
            }
            System.out.println(product);
        }
        sc.close();
    }
}