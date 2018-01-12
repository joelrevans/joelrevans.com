using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using System.IO;

namespace joelrevanscom
{
    public class EmbedHelper
    {
        public static MvcHtmlString EmbedTextFile(string path)
        {
            string apppath = HostingEnvironment.MapPath("~");
            string filepath = apppath + path;
            return new MvcHtmlString(File.ReadAllText(filepath));
        }
    }
}