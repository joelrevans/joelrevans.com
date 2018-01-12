using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ImageResizerLib;
using System.IO;
using System.Drawing;
using System.Data.Linq;
using System.Drawing.Imaging;
using ImageMagick;
using System.Text.RegularExpressions;

namespace GenerageImages
{
    class Program
    {
        static string rootDirectory = "..\\..\\..\\joelrevanscom";

        static void Main(string[] args)
        {
            if (Directory.Exists(rootDirectory + "\\imagecache"))
            {
                Directory.Delete(rootDirectory + "\\imagecache", true);
            }

            Regex pattern = new Regex("\\\\images\\\\");

            foreach (string d in Directory.EnumerateDirectories($"{ rootDirectory }\\images\\", "*", SearchOption.TopDirectoryOnly))
            {

                var jpg = Directory.EnumerateFiles(d, "*.jpg", SearchOption.AllDirectories).ToList();
                var gif = Directory.EnumerateFiles(d, "*.gif", SearchOption.AllDirectories).ToList();
                var png = Directory.EnumerateFiles(d, "*.png", SearchOption.AllDirectories).ToList();
                var allImg = jpg.Union(gif).Union(png);

                foreach (string f in allImg)
                {
                    string newpath = pattern.Replace(Path.GetDirectoryName(f), "\\imagecache\\", 1);
                    string newfile = Path.GetFileNameWithoutExtension(f);
                    Directory.CreateDirectory(newpath);

                    using (MagickImage newImg = new MagickImage(f))
                    {
                        newImg.Format = MagickFormat.Jpeg;

                        decimal shrink = 1m;
                        if (newImg.Width > 900)
                        {
                            shrink = 900m / Convert.ToDecimal(newImg.Width);
                        }
                        if (newImg.Height > 900)
                        {
                            shrink = Math.Min(900m / Convert.ToDecimal(newImg.Height), shrink);
                        }
                        newImg.Resize(Convert.ToInt32(newImg.Width * shrink), Convert.ToInt32(newImg.Height * shrink));
                        newImg.Write($"{newpath}\\{newfile}-w900.jpg");

                        if (newImg.Width > 100)
                        {
                            shrink = 100m / Convert.ToDecimal(newImg.Width);
                        }
                        if (newImg.Height > 100)
                        {
                            shrink = Math.Min(100m / Convert.ToDecimal(newImg.Height), shrink);
                        }

                        newImg.AdaptiveResize(Convert.ToInt32(newImg.Width * shrink), Convert.ToInt32(newImg.Height * shrink));
                        newImg.Write($"{newpath}\\{newfile}-w100.jpg");
                    }
                }
            }
        }
    }
}
