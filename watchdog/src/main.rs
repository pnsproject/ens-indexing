use std::time::Duration;

use tokio::{process::Command, time::sleep};

async fn start_program() {
    loop {
        let status = Command::new("sqd")
            .arg("process")
            .current_dir("..")
            .status()
            .await;

        match status {
            Ok(status) if status.success() => {
                // 如果程序正常退出，则输出退出代码并退出脚本
                println!("Your program exited with code {:?}", status.code());
                std::process::exit(0);
            }
            Ok(status) => {
                // 如果程序意外退出，则输出错误信息并重新启动程序
                println!("Your program encountered an error: {:?}", status);
            }
            Err(err) => {
                // 如果启动程序失败，则输出错误信息并重新启动程序
                println!("Failed to start your program: {:?}", err);
            }
        }

        // 等待 5 秒后重新启动程序
        sleep(Duration::from_secs(5)).await;
    }
}

#[tokio::main]
async fn main() {
    start_program().await;
}
