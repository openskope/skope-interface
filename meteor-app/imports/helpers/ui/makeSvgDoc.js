/**
 * Code in this file is stolen and modified from https://chrome.google.com/webstore/detail/export-svg-with-style/dkjdcaddoplepioppogpckelchefhddi?hl=en-GB
 */
/* eslint no-continue: off, no-bitwise: off, no-loop-func: off, no-param-reassign: off */
/*
                                Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "{}"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright 2014 Martin Graham

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// code adapted from user adardesign's answer in http://stackoverflow.com/questions/13204785/is-it-possible-to-read-the-styles-of-css-classes-not-being-used-in-the-dom-using
function usedStyles(elem, subtree, both) {
  const needed = [];
  let rule;
  const ownerDoc = elem.ownerDocument || document;
  const CSSSheets = ownerDoc.styleSheets;

  for (let j = 0; j < CSSSheets.length; j += 1) {
    // stop accessing empty style sheets (1.15), catch security exceptions (1.20)
    try {
      if (CSSSheets[j].cssRules == null) {
        continue;
      }
    } catch (err) {
      continue;
    }

    for (let i = 0; i < CSSSheets[j].cssRules.length; i += 1) {
      rule = CSSSheets[j].cssRules[i];
      let match = false;
      // Issue reported, css rule '[ng:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak, .ng-hide:not(.ng-hide-animate)' gives error
      // It's the [ng:cloak] bit that does the damage
      // Fix found from https://github.com/exupero/saveSvgAsPng/issues/11 - but the css rule isn't applied
      try {
        if (subtree) {
          match = elem.querySelectorAll(rule.selectorText).length > 0;
        }
        if (!subtree || both) {
          match |= elem.matches(rule.selectorText);
        }
      } catch (err) {
        console.warn(`CSS selector error: ${rule.selectorText}. Often angular issue.`, err);
      }
      if (match) { needed.push(rule.cssText); }
    }
  }

  return needed;
}

function parentChain(elem, styles) {
  // Capture id / classes of svg's parent chain.
  const ownerDoc = elem.ownerDocument || document;
  const elemArr = [];
  while (elem.parentNode !== ownerDoc && elem.parentNode !== null) {
    elem = elem.parentNode;
    elemArr.push({ id: elem.id, class: elem.getAttribute('class') || '' });
  }

  // see if id or element class are referenced in any styles collected below the svg node
  // if not, null the id / class as they're not going to be relevant
  elemArr.forEach(function (elemData) {
    const presences = { id: false, class: false };
    const classes = elemData.class.split(' ').filter(function(a) { return a.length > 0; });   // v1.13: may be multiple classes in a containing class attribute
    styles.forEach(function (style) {
      for (let c = 0; c < classes.length; c += 1) {
        if (style.indexOf(`.${classes[c]}`) >= 0) {
          presences.class = true;
          break;  // no need to keep looking through rest of classtypes if one is needed
        }
      }
      if (elemData.id && style.indexOf(`#${elemData.id}`) >= 0) {
        presences.id = true;
      }
    });
    Object.keys(presences).forEach(function (presence) {
      if (!presences[presence]) { elemData[presence] = undefined; }
    });
  });

  return elemArr;
}

/* from https://stackoverflow.com/questions/934012/get-image-data-in-javascript/42916772#42916772 */
function toDataURL(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', url);
  xhr.responseType = 'blob';
  xhr.onload = function() {
    const fr = new FileReader();

    fr.onload = function() {
      callback(this.result);
    };

    fr.readAsDataURL(xhr.response); // async call
  };

  xhr.send();
}

export
function makeSVGDocAsync(svgElem) {
  // clone node
  let cloneSVG = svgElem.cloneNode(true);
  const ownerDoc = cloneSVG.ownerDocument || document;

  // find all styles inherited/referenced at or below this node
  const styles = usedStyles(svgElem, true, true);

  // collect relevant info on parent chain of svg node
  const predecessorInfo = parentChain(svgElem, styles);

  // make a chain of dummy svg nodes to include classes / ids of parent chain of our original svg
  // this means any styles referenced within the svg that depend on the presence of these classes/ids are fired
  const transferAttr = ['width', 'height', 'xmlns'];
  let parentAdded = false;

  for (let p = 0; p < predecessorInfo.length; p += 1) {
    const pinf = predecessorInfo[p];
    const dummySVGElem = ownerDoc.createElement('svg');
    let empty = true;
    Object.keys(pinf).forEach(function(key) {
      if (pinf[key]) {
        dummySVGElem.setAttribute(key, pinf[key]);
        empty = false;
      }
    });
    // If the dummy svg has no relevant id, classes or computed style then ignore it, otherwise make it the new root
    if (!empty) {
      dummySVGElem.appendChild(cloneSVG);
      transferAttr.forEach(function(attr) {
        dummySVGElem.setAttribute(attr, cloneSVG.getAttribute(attr));
        cloneSVG.removeAttribute(attr);
      });
      cloneSVG = dummySVGElem;
      parentAdded = true;
    }
  }

  // if no dummy parent added in previous section, but our svg isn't root then add one as placeholder
  if (svgElem.parentNode != null && !parentAdded) {
    const dummySVGElem = ownerDoc.createElement('svg');
    dummySVGElem.appendChild(cloneSVG);
    transferAttr.forEach(function(attr) {
      dummySVGElem.setAttribute(attr, cloneSVG.getAttribute(attr));
      cloneSVG.removeAttribute(attr);
    });
    cloneSVG = dummySVGElem;
    parentAdded = true;
  }

  // Copy svg's computed style (it's style context) if a dummy parent node has been introduced
  if (parentAdded) {
    cloneSVG.setAttribute('style', window.getComputedStyle(svgElem).cssText);
  }

  cloneSVG.setAttribute('version', '1.1');
  cloneSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');    // XMLSerializer does this
  cloneSVG.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');  // when I used setAttributeNS it ballsed up

  const styleElem = ownerDoc.createElement('style');
  styleElem.setAttribute('type', 'text/css');
  const styleText = ownerDoc.createTextNode(styles.join('\n'));
  styleElem.appendChild(styleText);
  cloneSVG.insertBefore(styleElem, cloneSVG.firstChild);

  const promises = [];

  cloneSVG.querySelectorAll('image').forEach(function(img) {
    promises.push(new Promise(function(resolve) {
      toDataURL(img.href.baseVal, function(data) {
        img.href.baseVal = data;
        resolve();
      });
    }));
  });

  return new Promise(function(resolve) {
    Promise.all(promises).then(function() {
      resolve(cloneSVG);
    });
  });
}

export
function svgDocToBlob(svgDoc) {
  const xmls = new XMLSerializer();

  let xmlStr = xmls.serializeToString(svgDoc);
  // serializing adds an xmlns attribute to the style element ('cos it thinks we want xhtml), which knackers it for inkscape, here we chop it out
  xmlStr = xmlStr.split('xmlns="http://www.w3.org/1999/xhtml"').join('');

  return new Blob([xmlStr], { type: 'image/svg+xml' });
}
