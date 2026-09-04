//! CLI `crypto-core` — outil de signature / vérification / hachage.
//!
//! Utilisé par Go (`sync-service`, `go-gateway`) et les scripts d'intégrité
//! des APK — un canal de confiance entre les services et la lib Rust.
//!
//! Usage :
//!   crypto-cli keygen
//!   crypto-cli hash <message>
//!   crypto-cli sign <private_hex> <message>
//!   crypto-cli verify <public_hex> <message> <signature_hex>
//!   crypto-cli nonce <device_id> <sequence> <payload_hash>
use std::env;
use std::process::ExitCode;

use crypto_core::{SignKeyPair, compute_nonce, generate_keypair, hash_bytes, verify_bytes};

fn print_usage() {
    eprintln!("crypto-core CLI");
    eprintln!("  keygen");
    eprintln!("  hash <message>");
    eprintln!("  sign <private_hex> <message>");
    eprintln!("  verify <public_hex> <message> <signature_hex>");
    eprintln!("  nonce <device_id> <sequence> <payload_hash>");
}

fn main() -> ExitCode {
    let args: Vec<String> = env::args().collect();
    let Some(cmd) = args.get(1) else {
        print_usage();
        return ExitCode::from(2);
    };

    match cmd.as_str() {
        "keygen" => {
            let kp = generate_keypair();
            println!("private={}", kp.private_hex());
            println!("public={}", kp.public_hex());
            ExitCode::SUCCESS
        }
        "hash" => {
            let Some(msg) = args.get(2) else { print_usage(); return ExitCode::from(2); };
            println!("{}", hash_bytes(msg.as_bytes()));
            ExitCode::SUCCESS
        }
        "sign" => {
            let Some(private_hex) = args.get(2) else { print_usage(); return ExitCode::from(2); };
            let Some(msg) = args.get(3) else { print_usage(); return ExitCode::from(2); };
            match SignKeyPair::from_private_hex(private_hex) {
                Some(kp) => {
                    println!("{}", kp.sign_hex(msg.as_bytes()));
                    ExitCode::SUCCESS
                }
                None => {
                    eprintln!("invalid private key hex");
                    ExitCode::from(1)
                }
            }
        }
        "verify" => {
            let (Some(pub_hex), Some(msg), Some(sig)) = (args.get(2), args.get(3), args.get(4)) else {
                print_usage();
                return ExitCode::from(2);
            };
            if verify_bytes(pub_hex, msg.as_bytes(), sig) {
                println!("ok");
                ExitCode::SUCCESS
            } else {
                println!("invalid");
                ExitCode::from(1)
            }
        }
        "nonce" => {
            let (Some(dev), Some(seq), Some(payload)) = (args.get(2), args.get(3), args.get(4)) else {
                print_usage();
                return ExitCode::from(2);
            };
            let seq: u64 = seq.parse().unwrap_or(0);
            println!("{}", compute_nonce(dev, seq, payload));
            ExitCode::SUCCESS
        }
        _ => {
            print_usage();
            ExitCode::from(2)
        }
    }
}
