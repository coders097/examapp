import java.util.*;
public class Solution{
    public static void main (String[] args) {
        Scanner sc=new Scanner(System.in);
        int t=sc.nextInt();
        while(t-->0){
            int n=sc.nextInt();
            int res=1;
            for(int i=1;i<=n;i++) res*=i;
            System.out.println(res);
        }
        sc.close();
    }
}